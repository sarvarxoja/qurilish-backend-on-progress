import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/sequelize';

import { LoginDto } from '../dto/login.dto';

import { JwtHelper } from 'src/common/utils/jwt';
import { CryptoHelper } from 'src/common/utils/crypto';

import { User } from 'src/modules/users/models/users.model';
import { Device } from 'src/modules/users/models/device.model';

import { LoginResponse } from '../interfaces/login-interface';
import { DeviceHelper } from 'src/common/helper/device.helper';
import { RefreshPayload } from '../interfaces/refresh-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) // 2. Modelni Inject qiling
    private readonly userModel: typeof User,
    @InjectModel(Device)
    private readonly deviceModel: typeof Device,
  ) {}

  async login(loginDto: LoginDto, req: Request): Promise<LoginResponse> {
    let { phone_number, password, device_id } = loginDto;
    const { ip, deviceName, browser, os } = DeviceHelper.extractDeviceMeta(req);

    let data = await this.userModel.findOne({
      where: { phone_number: phone_number },
    });

    if (!data) {
      throw new NotFoundException('User not found.');
    }

    if (data.is_blocked === true) {
      throw new UnauthorizedException('This user has been blocked.');
    }

    if (data) {
      let check_password = await CryptoHelper.comparePassword(
        password,
        data.password,
      );

      if (check_password) {
        const existingDevice = await this.deviceModel.findOne({
          where: { user_id: data.id, device_id },
        });

        if (existingDevice) {
          existingDevice.lastLogin = new Date();
          existingDevice.ip = ip;
          existingDevice.deviceName = deviceName;
          existingDevice.browser = browser;
          existingDevice.os = os;
          await existingDevice.save();
        } else {
          await this.deviceModel.create({
            user_id: data.id,
            device_id,
            lastLogin: new Date(),
            ip,
            deviceName,
            browser,
            os,
          });
        }

        const refreshToken = await JwtHelper.jwtRefreshSign(
          data.id,
          data.token_version,
          device_id,
        );

        const accessToken = await JwtHelper.jwtSign(
          data.id,
          data.token_version,
          data.company_id,
          device_id,
        );

        return {
          id: String(data.id),
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          role: data.role,
          phone_number: data.phone_number,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      } else {
        throw new UnauthorizedException('Wrong phone_number or password');
      }
    } else {
      throw new UnauthorizedException('Wrong phone_number or password');
    }
  }

  async refresh(payload: RefreshPayload) {
    const { id, version, device_id } = payload;

    const user = await this.userModel.findByPk(id, { include: [Device] });
    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    // 1. Token versiyasini tekshirish (Xavfsizlik uchun eng muhimi)
    if (user.token_version !== version) {
      throw new UnauthorizedException(
        'Xavfsizlik xavfi: Token versiyasi mos emas!',
      );
    }

    // 2. Qurilmani tekshirish
    const devices = Array.isArray(user.devices) ? user.devices : [];
    const deviceExists = devices.find((d) => d.device_id === device_id);
    if (!deviceExists) {
      throw new UnauthorizedException('Ushbu qurilma tizimdan chiqarilgan');
    }

    // 3. Yangi tokenlarni yaratish
    const accessToken = await JwtHelper.jwtSign(
      user.id,
      user.token_version,
      user.company_id,
      device_id,
    );
    const newRefreshToken = await JwtHelper.jwtRefreshSign(
      user.id,
      user.token_version,
      device_id,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken, // Interseptor buni cookiega yozadi
    };
  }
}
