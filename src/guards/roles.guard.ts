import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read roles metadata from handler or controller
    const requiredRoles =
      this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: Roles } | undefined;

    // Ensure JwtAuthGuard has run first to set request.user
    if (!user) {
      throw new ForbiddenException(
        'Access denied: Authentication required. JwtAuthGuard must be applied before RolesGuard.',
      );
    }

    if (!user.role) {
      throw new ForbiddenException('Access denied: no role assigned');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}


