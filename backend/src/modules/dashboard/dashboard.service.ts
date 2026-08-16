import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../database/entities/tenant.entity';
import { TenantSubscription } from '../../database/entities/tenant-subscription.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import {
  BillingCycle,
  InvoiceStatus,
  SubscriptionStatus,
  TenantStatus,
} from '../../database/entities/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Tenant) private readonly tenantsRepo: Repository<Tenant>,
    @InjectRepository(TenantSubscription)
    private readonly subscriptionsRepo: Repository<TenantSubscription>,
    @InjectRepository(Invoice)
    private readonly invoicesRepo: Repository<Invoice>,
  ) {}

  async getSummary() {
    const [
      totalTenants,
      activeTenants,
      onboardingTenants,
      suspendedTenants,
      activeSubscriptions,
      overdueInvoices,
      recentTenants,
    ] = await Promise.all([
      this.tenantsRepo.count(),
      this.tenantsRepo.count({ where: { status: TenantStatus.ACTIVE } }),
      this.tenantsRepo.count({ where: { status: TenantStatus.ONBOARDING } }),
      this.tenantsRepo.count({ where: { status: TenantStatus.SUSPENDED } }),
      this.subscriptionsRepo.find({
        where: { status: SubscriptionStatus.ACTIVE },
        relations: { plan: true },
      }),
      this.invoicesRepo.count({ where: { status: InvoiceStatus.OVERDUE } }),
      this.tenantsRepo.find({ order: { createdAt: 'DESC' }, take: 5 }),
    ]);

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const monthly =
        sub.plan.billingCycle === BillingCycle.YEARLY
          ? Number(sub.plan.price) / 12
          : Number(sub.plan.price);
      return sum + monthly;
    }, 0);

    return {
      totalTenants,
      activeTenants,
      onboardingTenants,
      suspendedTenants,
      activeSubscriptions: activeSubscriptions.length,
      overdueInvoices,
      mrr: Math.round(mrr * 100) / 100,
      recentTenants,
    };
  }
}
