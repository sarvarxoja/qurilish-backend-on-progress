import { User } from '../models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CryptoHelper } from 'src/common/utils/crypto';
import { createUserDto } from '../dto/users-create.dto';
import { idParamDto } from 'src/common/dtos/id-param.dto';

import { userQueryDto } from '../dto/user-query.dto';
import { Company } from 'src/modules/company/models/company.model';
import { RedisService } from 'src/common/redis/cashe.service';
import { EsService } from 'src/common/elasticsearch/es.service';
import { UsersIndex } from '../interfaces/users-es.interface';
import { PaginatedUserResponse } from '../interfaces/paginated-user.interface';
import { Device } from '../models/device.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) // 2. Modelni Inject qiling
    private readonly userModel: typeof User,
    private redisService: RedisService,
    private esService: EsService,
  ) {}

  private readonly index = 'users';

  async create(createUserDto: createUserDto) {
    const hashedPassword = await CryptoHelper.hashPassword(
      createUserDto.password,
    );

    const userData = {
      ...createUserDto,
      password: hashedPassword,
    };

    const newUserData = await this.userModel.create(userData);

    let user = await this.userModel.findByPk(newUserData.id, {
      include: [{ model: Company }], // Relationni ulash
    });

    await this.esService.index<UsersIndex>(this.index, {
      id: user!.id,
      first_name: user!.first_name,
      middle_name: user!.middle_name,
      last_name: user!.last_name,
      email: user!.email,
      role: user!.role,
      company: {
        id: user!.company!.id,
        name: user!.company!.name,
        tin: user!.company!.tin,
        company_created_date: user!.company!.company_created_date,
        document: user!.company!.document,
      },
      phone_number: user!.phone_number,
    });

    const userJson = user?.toJSON();

    if (userJson) {
      await this.redisService.set<Partial<User>>(
        `user:${userJson.id}`,
        userJson,
        3600,
      );
      // Invalidate cached list (default pagination)
      await this.redisService.del('users:all:page:1:limit:10');
    }

    return user;
  }

  async findOne(paramDto: idParamDto) {
    let { id } = paramDto;
    const cacheKey = `user:${id}`;

    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) {
      console.log("redisdan olindi");
      return cachedUser;
    }

    const user = await this.userModel.findByPk(id, {
      include: [Company, { model: Device, as: 'devices' }],
    });
    if (!user) throw new NotFoundException();

    console.log("bazdan olindi")
    const userJson = user.toJSON();
    await this.redisService.set<Partial<User>>(cacheKey, userJson, 3600);
    return userJson;
  }

  async findAll(userQueryDto: userQueryDto) {
    let { query, page = 1, limit = 10 } = userQueryDto;
    const offset = (page - 1) * limit;

    // --- 1. SEARCH (ELASTICSEARCH) ---
    if (query) {
      const searchResults = await this.esService.search('users', {
        from: offset,
        size: limit,
        query: {
          multi_match: {
            query: query,
            fields: [
              'first_name',
              'middle_name',
              'last_name',
              'email',
              'phone_number',
              'role',
            ],
            fuzziness: 'AUTO',
          },
        },
      });

      const hits = searchResults?.hits ?? [];
      const total =
        typeof searchResults?.total === 'number'
          ? searchResults.total
          : hits.length;

      return {
        data: hits,
        meta: {
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    const cacheKey = `users:all:page:${page}:limit:${limit}`;
    const cachedData = await this.redisService.get(cacheKey);

    if (cachedData) {
      console.log('Redisdan kesh olindi');
      return cachedData;
    }

    // --- 3. DATABASE (POSTGRESQL) ---
    console.log('Bazadan olinmoqda...');
    const { rows, count } = await this.userModel.findAndCountAll({
      limit,
      offset,
      include: [Company],
      order: [['createdAt', 'DESC']],
    });

    const response = {
      data: rows.map((u) => u.toJSON()),
      meta: {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };

    // --- 4. SAVE TO REDIS ---
    // Keshni 5-10 daqiqaga saqlash tavsiya etiladi
    await this.redisService.set<Partial<PaginatedUserResponse>>(
      cacheKey,
      response,
      600,
    );

    return response;
  }

  async remove(id: string) {
    const deleted = await this.userModel.destroy({ where: { id } });
    if (!deleted) throw new NotFoundException('User not found');

    await this.esService.remove(this.index, id.toString());

    // Keshni o'chirish
    await this.redisService.del(`user:${id}`);
    // Invalidate cached list (default pagination)
    await this.redisService.del('users:all:page:1:limit:10');

    return {
      statusCode: 200,
      message: 'User deleted',
    };
  }
}
