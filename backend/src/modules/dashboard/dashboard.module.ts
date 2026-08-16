import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Tenant } from '../../database/entities/tenant.entity';
import { TenantSubscription } from '../../database/entities/tenant-subscription.entity';
import { Invoice } from '../../database/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantSubscription, Invoice])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
