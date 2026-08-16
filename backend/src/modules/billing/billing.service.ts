import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSubscription } from '../../database/entities/tenant-subscription.entity';
import { TenantPlanHistory } from '../../database/entities/tenant-plan-history.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';
import {
  InvoiceStatus,
  PlanChangeAction,
  SubscriptionStatus,
} from '../../database/entities/enums';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PaginationQueryDto, Paginated } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(TenantSubscription)
    private readonly subscriptionsRepo: Repository<TenantSubscription>,
    @InjectRepository(TenantPlanHistory)
    private readonly planHistoryRepo: Repository<TenantPlanHistory>,
    @InjectRepository(Invoice)
    private readonly invoicesRepo: Repository<Invoice>,
    @InjectRepository(SubscriptionPlan)
    private readonly plansRepo: Repository<SubscriptionPlan>,
  ) {}

  async getCurrentSubscription(
    tenantId: string,
  ): Promise<TenantSubscription | null> {
    const active = await this.subscriptionsRepo.findOne({
      where: { tenantId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    if (active) return active;
    return this.subscriptionsRepo.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Changes (or starts) a tenant's subscription plan: closes out any existing
   * active subscription, opens a new one, and writes a plan-history entry.
   * Backs the "Tenant Subscription" screen's plan-change action.
   */
  async changePlan(
    tenantId: string,
    dto: ChangePlanDto,
    actor?: AuthenticatedUser,
  ): Promise<TenantSubscription> {
    const newPlan = await this.plansRepo.findOne({ where: { id: dto.planId } });
    if (!newPlan) throw new NotFoundException('Subscription plan not found');

    const current = await this.getCurrentSubscription(tenantId);

    let action: PlanChangeAction;
    if (!current) {
      action = PlanChangeAction.NEW_SUBSCRIPTION;
    } else if (Number(newPlan.price) > Number(current.plan.price)) {
      action = PlanChangeAction.UPGRADE;
    } else if (Number(newPlan.price) < Number(current.plan.price)) {
      action = PlanChangeAction.DOWNGRADE;
    } else {
      action = PlanChangeAction.RENEWAL;
    }

    if (current && current.status === SubscriptionStatus.ACTIVE) {
      current.status = SubscriptionStatus.CANCELLED;
      current.endDate = new Date();
      current.cancelledAt = new Date();
      await this.subscriptionsRepo.save(current);
    }

    const newSubscription = await this.subscriptionsRepo.save(
      this.subscriptionsRepo.create({
        tenantId,
        planId: newPlan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
      }),
    );

    await this.planHistoryRepo.save(
      this.planHistoryRepo.create({
        tenantId,
        fromPlanId: current?.planId,
        toPlanId: newPlan.id,
        action,
        effectiveDate: new Date(),
        note: dto.note,
        changedById: actor?.userId,
      }),
    );

    return newSubscription;
  }

  async cancelSubscription(
    tenantId: string,
    actor?: AuthenticatedUser,
  ): Promise<void> {
    const current = await this.getCurrentSubscription(tenantId);
    if (!current)
      throw new NotFoundException('No active subscription for this tenant');

    current.status = SubscriptionStatus.CANCELLED;
    current.cancelledAt = new Date();
    current.endDate = new Date();
    await this.subscriptionsRepo.save(current);

    await this.planHistoryRepo.save(
      this.planHistoryRepo.create({
        tenantId,
        fromPlanId: current.planId,
        toPlanId: current.planId,
        action: PlanChangeAction.CANCELLATION,
        effectiveDate: new Date(),
        changedById: actor?.userId,
      }),
    );
  }

  getPlanHistory(tenantId: string): Promise<TenantPlanHistory[]> {
    return this.planHistoryRepo.find({
      where: { tenantId },
      relations: { fromPlan: true, toPlan: true },
      order: { effectiveDate: 'DESC' },
    });
  }

  async listInvoices(
    query: PaginationQueryDto & { tenantId?: string },
  ): Promise<Paginated<Invoice>> {
    const { page, pageSize, tenantId } = query;
    const [items, total] = await this.invoicesRepo.findAndCount({
      where: tenantId ? { tenantId } : undefined,
      relations: { tenant: true },
      order: { issueDate: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepo.findOne({
      where: { id },
      relations: { tenant: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const count = await this.invoicesRepo.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const invoice = this.invoicesRepo.create({
      ...dto,
      invoiceNumber,
      currency: dto.currency ?? 'USD',
      status: InvoiceStatus.PENDING,
    });
    return this.invoicesRepo.save(invoice);
  }

  async markPaid(id: string): Promise<Invoice> {
    const invoice = await this.getInvoice(id);
    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = new Date();
    return this.invoicesRepo.save(invoice);
  }

  async markOverdue(id: string): Promise<Invoice> {
    const invoice = await this.getInvoice(id);
    invoice.status = InvoiceStatus.OVERDUE;
    return this.invoicesRepo.save(invoice);
  }
}
