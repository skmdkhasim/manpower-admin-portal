import { Role } from './entities/role.entity';
import { SuperAdminUser } from './entities/super-admin-user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Tenant } from './entities/tenant.entity';
import { TenantBranch } from './entities/tenant-branch.entity';
import { TenantUser } from './entities/tenant-user.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { TenantSubscription } from './entities/tenant-subscription.entity';
import { TenantPlanHistory } from './entities/tenant-plan-history.entity';
import { Invoice } from './entities/invoice.entity';

/** Single source of truth for TypeORM's entity list (app module + CLI data source). */
export const entities = [
  Role,
  SuperAdminUser,
  RefreshToken,
  Tenant,
  TenantBranch,
  TenantUser,
  SubscriptionPlan,
  TenantSubscription,
  TenantPlanHistory,
  Invoice,
];
