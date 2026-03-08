import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { AuthResponse } from './dto/auth-response.dto';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './services/auth.service';
import { RefreshTokenGuard } from './guard/refresh-token.guard';
import { RequestUser } from 'src/common/decorator/user.decorator';
import { LoginCookieInterceptor } from './interceptors/login-interceptor';
import { LogoutCookieInterceptor } from './interceptors/logout-interceptor';
import { Public } from 'src/common/decorator/public.decorator';
import { RefreshInterface } from './interfaces/refresh-interface';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(LoginCookieInterceptor)
  @Post('/login')
  @Public()
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    let user = await this.authService.login(loginDto, req);

    return plainToInstance(AuthResponse, user, {
      excludeExtraneousValues: true,
    });
  }

  @UseInterceptors(LogoutCookieInterceptor)
  @Post('/logout')
  @Public()
  async logout() {
    return { logout: true };
  }

  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(LoginCookieInterceptor) // Login va Refresh uchun bir xil interseptor
  @Post('refresh')
  async refresh(@RequestUser() userPayload: RefreshInterface) {
    // Custom decorator yordamida req.user ni olamiz
    return await this.authService.refresh(userPayload);
  }
}
