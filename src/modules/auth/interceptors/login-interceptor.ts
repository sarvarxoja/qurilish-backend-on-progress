// cookie.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class LoginCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Agar controllerdan refreshToken qaytsa, uni cookiega uramiz
        if (data && data.refreshToken) {
          response.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
          });
          
          // Xavfsizlik uchun tokenni JSON javobdan o'chirib tashlash mumkin
          delete data.refreshToken;
        }
        return data;
      }),
    );
  }
}