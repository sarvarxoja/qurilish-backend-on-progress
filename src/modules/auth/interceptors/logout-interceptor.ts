import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { LogoutResponse } from '../interfaces/logout-interface';

@Injectable()
export class LogoutCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<LogoutResponse> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Agar controller { logout: true } qaytarsa
        if (data && data.logout === true) {
          response.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,   // Productionda har doim true bo'lishi kerak
            sameSite: 'none', // Frontend va Backend boshqa domen bo'lsa 'none'
            path: '/',
          });
          
          // Foydalanuvchiga logout: true degan javobni qaytarib o'tirmaymiz
          return { message: 'Logout successful' };
        }
        return data;
      }),
    );
  }
}