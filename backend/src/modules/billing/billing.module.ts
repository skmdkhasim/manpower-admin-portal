import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { TenantSubscription } from '../../database/entities/tenant-subscription.entity';
import { TenantPlanHistory } from '../../database/entities/tenant-plan-history.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantSubscription,
      TenantPlanHistory,
      Invoice,
      SubscriptionPlan,
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
