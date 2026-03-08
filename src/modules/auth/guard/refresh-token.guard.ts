import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.refreshToken;
    const REFRESH_KEY = process.env.REFRESH_KEY;

    if (!token) throw new UnauthorizedException('Refresh token topilmadi');

    if (!REFRESH_KEY)
      throw new Error('REFRESH_KEY is not defined in environment variables');

    try {
      const payload = jwt.verify(token, REFRESH_KEY);
      request.user = payload; // Payloadni keyingi bosqichga o'tkazamiz
      return true;
    } catch (e) {
      throw new UnauthorizedException('Token yaroqsiz yoki muddati o’tgan');
    }
  }
}
