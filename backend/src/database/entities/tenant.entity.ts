import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TenantOnboardingStep, TenantStatus } from './enums';
import { TenantBranch } from './tenant-branch.entity';
import { TenantUser } from './tenant-user.entity';
import { TenantSubscription } from './tenant-subscription.entity';
import { TenantPlanHistory } from './tenant-plan-history.entity';
import { Invoice } from './invoice.entity';

/**
 * A tenant is a client company using the manpower management platform
 * (the entity the Super Admin Portal manages). Corresponds to the
 * "Tenants" screens in the design (list, new, overview, onboarding...).
 */
@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  slug: string; // used for subdomain / login routing

  @Column({ nullable: true })
  industry?: string;

  @Column({ name: 'contact_name', nullable: true })
  contactName?: string;

  @Column({ name: 'contact_email' })
  contactEmail: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ONBOARDING,
  })
  status: TenantStatus;

  @Column({
    name: 'onboarding_step',
    type: 'enum',
    enum: TenantOnboardingStep,
    default: TenantOnboardingStep.COMPANY_DETAILS,
  })
  onboardingStep: TenantOnboardingStep;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  /**
   * Number of client companies this tenant (a manpower/staffing agency)
   * currently supplies workers to. Self-reported by the tenant / entered
   * by the Super Admin during onboarding — shown on the tenant overview.
   */
  @Column({ name: 'client_company_count', type: 'int', nullable: true })
  clientCompanyCount?: number | null;

  @OneToMany(() => TenantBranch, (branch) => branch.tenant)
  branches: TenantBranch[];

  @OneToMany(() => TenantUser, (user) => user.tenant)
  users: TenantUser[];

  @OneToMany(() => TenantSubscription, (sub) => sub.tenant)
  subscriptions: TenantSubscription[];

  @OneToMany(() => TenantPlanHistory, (h) => h.tenant)
  planHistory: TenantPlanHistory[];

  @OneToMany(() => Invoice, (invoice) => invoice.tenant)
  invoices: Invoice[];
}
