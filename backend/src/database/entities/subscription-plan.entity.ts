import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BillingCycle } from './enums';
import { TenantSubscription } from './tenant-subscription.entity';

/** A purchasable plan (e.g. Starter, Growth, Enterprise) tenants subscribe to. */
@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  code: string; // e.g. "STARTER_MONTHLY"

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @Column({ name: 'max_users', default: 5 })
  maxUsers: number;

  @Column({ name: 'max_branches', default: 1 })
  maxBranches: number;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  features: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => TenantSubscription, (sub) => sub.plan)
  subscriptions: TenantSubscription[];
}
