import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { PlanChangeAction } from './enums';

/**
 * Audit trail of plan changes for a tenant (upgrades, downgrades, renewals,
 * cancellations) — backs the "Tenant Plan History" screen.
 */
@Entity('tenant_plan_history')
export class TenantPlanHistory extends BaseEntity {
  @ManyToOne(() => Tenant, (tenant) => tenant.planHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => SubscriptionPlan, { nullable: true })
  @JoinColumn({ name: 'from_plan_id' })
  fromPlan?: SubscriptionPlan;

  @Column({ name: 'from_plan_id', nullable: true })
  fromPlanId?: string;

  @ManyToOne(() => SubscriptionPlan, { eager: true })
  @JoinColumn({ name: 'to_plan_id' })
  toPlan: SubscriptionPlan;

  @Column({ name: 'to_plan_id' })
  toPlanId: string;

  @Column({ type: 'enum', enum: PlanChangeAction })
  action: PlanChangeAction;

  @Column({ name: 'effective_date', type: 'timestamptz' })
  effectiveDate: Date;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ name: 'changed_by_id', nullable: true })
  changedById?: string; // SuperAdminUser id, if changed by an admin
}
