// src/common/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/sequelize';
import { JwtHelper } from 'src/common/utils/jwt';
import { User } from 'src/modules/users/models/users.model';
import { Device } from 'src/modules/users/models/device.model';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Device) private readonly deviceModel: typeof Device,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 1. Token borligini tekshirish
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token topilmadi yoki format xato');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token bo‘sh');
    }

    try {
      // 2. JWT Decode va Verify
      const payload = await JwtHelper.jwtVerify(token); 
      // Payload ichida: { id, version, device_id } bor deb hisoblaymiz

      // 3. Bazadan foydalanuvchini va qurilmani tekshirish
      const user = await this.userModel.findByPk(payload.id, {
        include: [
          { 
            model: Device,
            where: { device_id: payload.device_id },
            required: false, // Qurilma o'chirilgan bo'lishi mumkinligini tekshirish uchun
          },
        ],
      });

      if (!user) {
        throw new UnauthorizedException('Foydalanuvchi topilmadi');
      }

      // 4. Token versiyasini solishtirish
      if (user.token_version !== payload.version) {
        throw new UnauthorizedException('Token eskirgan, qayta login qiling');
      }

      // 5. Qurilma bazada mavjudligini tekshirish
      const currentDevice = user.devices?.find(d => d.device_id === payload.device_id);
      if (!currentDevice) {
        throw new UnauthorizedException('Ushbu qurilmadan foydalanish taqiqlangan');
      }

      // Requestga foydalanuvchi ma'lumotlarini biriktirish
      request.user = user;
      return true;
    } catch (e) {
      // Agar xato bizning UnauthorizedException bo'lsa shuni qaytaramiz
      if (e instanceof UnauthorizedException) throw e;
      
      throw new UnauthorizedException('Token yaroqsiz yoki muddati o‘tgan');
    }
  }
}
