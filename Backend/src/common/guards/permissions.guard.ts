import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRoles } from '@prisma/client';
import { ResourceCategory, PermissionAction, IPermission } from '../types/permissions.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<{ category: ResourceCategory; action: PermissionAction }>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true; // Bu endpoint xavfsizlik (permission) talab qilmaydi
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi tizimga kirmagan');
    }

    console.log('PermissionsGuard hit for user role:', user.role);

    // SUPERADMIN, ADMIN va MENTOR har doim hamma narsaga ruxsatga ega
    // (ular RolesGuard orqali allaqachon himoyalangan)
    if (
      user.role === UserRoles.SUPERADMIN ||
      user.role === UserRoles.ADMIN ||
      user.role === UserRoles.MENTOR
    ) {
      return true;
    }

    const userPermissions: IPermission[] = user.permissions;

    if (!userPermissions || !Array.isArray(userPermissions)) {
      throw new ForbiddenException('Sizda ruxsatlar sozlanmagan');
    }

    // So'ralgan ruxsatni foydalanuvchining permissions ro'yxatidan qidirish
    const hasAccess = userPermissions.some(
      (perm) =>
        perm.category === requiredPermission.category &&
        perm.access.includes(requiredPermission.action)
    );

    if (!hasAccess) {
      throw new ForbiddenException('Sizda ushbu amalni bajarish uchun yetarli ruxsat yo\'q');
    }

    return true;
  }
}
