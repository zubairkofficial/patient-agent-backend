import { SetMetadata } from '@nestjs/common';
import { Roles } from '../roles.enum';

export const ROLES_KEY = 'roles';

// Usage: @roles([Roles.ADMIN, Roles.USER])
export const roles = (rolesArray: Roles[]) => SetMetadata(ROLES_KEY, rolesArray);


