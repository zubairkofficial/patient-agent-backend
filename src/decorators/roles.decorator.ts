import { SetMetadata } from '@nestjs/common';
import { Roles as RolesEnum } from '../auth/roles.enum';

export const ROLES_KEY = 'roles';

// Usage: @Roles([RolesEnum.ADMIN, RolesEnum.USER])
export const Roles = (rolesArray: RolesEnum[]) => SetMetadata(ROLES_KEY, rolesArray);
