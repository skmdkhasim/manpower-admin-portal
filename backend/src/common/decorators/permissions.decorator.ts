import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Restricts a route to Super Admin users whose role includes ALL of the
 * given permission keys (e.g. "tenants.write", "billing.read").
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
