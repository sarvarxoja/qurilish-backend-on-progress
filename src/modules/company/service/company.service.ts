import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from '../models/company.model';

import { companyCreateDto } from '../dto/company-create.dto';
import { RedisService } from 'src/common/redis/cashe.service';
import { EsService } from 'src/common/elasticsearch/es.service';
import { CompanyIndex } from '../interfaces/company.es-interface';
import { idParamDto } from 'src/common/dtos/id-param.dto';
import { companyQueryDto } from '../dto/company-query.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);
  constructor(
    @InjectModel(Company)
    private readonly companyModel: typeof Company,
    private redisService: RedisService,
    private esService: EsService,
  ) {}

  private readonly index = 'companies';

  async create(createDto: companyCreateDto, documentPath: string) {
    const company = await this.companyModel.create({
      ...createDto,
      document: documentPath,
      users: [],
    });

    await this.esService.index<CompanyIndex>(this.index, {
      id: company.id,
      name: company.name,
      tin: company.tin,
      company_created_date: company.company_created_date,
    });

    const companyJson = company.toJSON();

    if (companyJson) {
      await this.redisService.set<Partial<Company>>(
        `company:${companyJson.id}`,
        companyJson,
        3600,
      );

      await this.redisService.del('companies:all:page:1:limit:10');
    }

    return company;
  }

  async findOne(paramDto: idParamDto) {
    let { id } = paramDto;
    const cacheKey = `campany:${id}`;

    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) return cachedUser;

    const campany = await this.companyModel.findByPk(id);
    if (!campany) throw new NotFoundException();

    const campanyJson = campany.toJSON();
    await this.redisService.set<Partial<Company>>(cacheKey, campanyJson, 3600);
    return campanyJson;
  }

  async findAll(companyQueryDto: companyQueryDto) {
    let {
      name,
      tin,
      company_created_date,
      page = 1,
      limit = 10,
    } = companyQueryDto;
    const offset = (page - 1) * limit;

    // --- 1. SEARCH (ELASTICSEARCH) ---d
    // Dinamik qidiruv shartlarini yig'amiz
    const must: any[] = [];

    if (name) {
      must.push({
        match: {
          name: {
            query: name,
            fuzziness: 'AUTO', // Ismdagi kichik xatolarni ham topadi
            operator: 'and', // Agar "Yandex Uzbekistan" yozilsa, ikkala so'z ham bo'lishi shart
          },
        },
      });
    }

    if (tin) {
      // TIN (STIR) odatda aniq qiymat bo'lgani uchun 'term' yoki aniq 'match' ishlatiladi
      must.push({ match: { tin: tin } });
    }

    if (company_created_date) {
      must.push({ match: { company_created_date: company_created_date } });
    }

    // Agar qidiruv parametrlaridan biri mavjud bo'lsa, ES dan qidiramiz
    if (must.length > 0) {
      const searchResults = await this.esService.search('companies', {
        from: offset,
        size: limit,
        query: {
          bool: { must: must },
        },
      });

      const hits = searchResults?.hits ?? [];
      // ES 7.x+ versiyalarida total obyekt ko'rinishida keladi: { value: 100, relation: 'eq' }
      const total =
        typeof searchResults?.total === 'number'
          ? searchResults.total
          : ((searchResults?.total as any)?.value ?? hits.length);

      return {
        data: hits,
        meta: {
          totalItems: total,
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // --- 2. CACHE (REDIS) ---
    // Qidiruv bo'lmaganda keshdan tekshiramiz
    const cacheKey = `companies:all:page:${page}:limit:${limit}`;
    const cachedData = await this.redisService.get(cacheKey);

    if (cachedData) {
      this.logger.log('Redisdan kesh olindi');
      return cachedData;
    }

    // --- 3. DATABASE (POSTGRESQL) ---
    this.logger.log('Bazadan olinmoqda...');
    const { rows, count } = await this.companyModel.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const response = {
      data: rows.map((c) => c.toJSON()),
      meta: {
        totalItems: count,
        currentPage: Number(page),
        totalPages: Math.ceil(count / limit),
      },
    };

    // --- 4. SAVE TO REDIS ---
    // Ma'lumotlarni 10 minutga keshga saqlaymiz
    await this.redisService.set(cacheKey, response, 600);

    return response;
  }

  async remove(paramDto: idParamDto) {
    let { id } = paramDto;
    const deleted = await this.companyModel.destroy({ where: { id } });

    if (!deleted) throw new NotFoundException('Company not found');

    await this.esService.remove(this.index, id.toString());

    // Keshni o'chirish
    await this.redisService.del(`company:${id}`);

    return {
      statusCode: 200,
      message: 'Company deleted',
    };
  }
}