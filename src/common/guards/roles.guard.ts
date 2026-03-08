// src/common/guards/roles.guard.ts
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Sizda ushbu amal uchun ruxsat yo‘q');
    }

    // --- Ierarxiya Logikasi ---
    // 1. ADMIN hamma narsani qila oladi
    if (user.role === 'ADMIN') return true;

    // 2. Rolni tekshirish
    const hasRole = requiredRoles.includes(user.role);
    
    // 3. CAMPANY_ADMIN USER qiladigan ishlarni ham qila olishi kerak bo'lsa:
    if (user.role === 'CAMPANY_ADMIN' && requiredRoles.includes('USER')) {
      return true;
    }

    if (!hasRole) {
      throw new ForbiddenException('Ushbu resursga kirish huquqingiz yo‘q');
    }

    return true;
  }
}
