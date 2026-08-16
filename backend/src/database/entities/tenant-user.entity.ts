import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { TenantBranch } from './tenant-branch.entity';
import { TenantUserRole, TenantUserStatus } from './enums';

/** A staff user belonging to a tenant company (not a Super Admin Portal user). */
@Entity('tenant_users')
export class TenantUser extends BaseEntity {
  @ManyToOne(() => Tenant, (tenant) => tenant.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantBranch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch?: TenantBranch;

  @Column({ name: 'branch_id', nullable: true })
  branchId?: string;

  @Column()
  fullName: string;

  @Index()
  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: TenantUserRole,
    default: TenantUserRole.VIEWER,
  })
  role: TenantUserRole;

  @Column({
    type: 'enum',
    enum: TenantUserStatus,
    default: TenantUserStatus.INVITED,
  })
  status: TenantUserStatus;

  @Column({ name: 'invited_at', type: 'timestamptz', nullable: true })
  invitedAt?: Date;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;
}
