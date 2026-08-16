import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { TenantSubscription } from './tenant-subscription.entity';
import { InvoiceStatus } from './enums';

/** A billing invoice issued to a tenant — backs the "Billing" screen. */
@Entity('invoices')
export class Invoice extends BaseEntity {
  @ManyToOne(() => Tenant, (tenant) => tenant.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantSubscription, { nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription?: TenantSubscription;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId?: string;

  @Index({ unique: true })
  @Column({ name: 'invoice_number' })
  invoiceNumber: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Column({ name: 'issue_date', type: 'timestamptz' })
  issueDate: Date;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date;

  @Column({ name: 'pdf_url', nullable: true })
  pdfUrl?: string;
}
