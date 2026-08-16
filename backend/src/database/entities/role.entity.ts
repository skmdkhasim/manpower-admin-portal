import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SuperAdminUser } from './super-admin-user.entity';

/**
 * A role assignable to Super Admin portal users, e.g. SUPER_ADMIN, SUPPORT.
 * `permissions` is a flat list of permission keys (e.g. "tenants.write")
 * checked by the RolesGuard / PermissionsGuard.
 */
@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string; // e.g. "SUPER_ADMIN", "BILLING_ADMIN", "SUPPORT_AGENT"

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  permissions: string[];

  @OneToMany(() => SuperAdminUser, (user) => user.role)
  users: SuperAdminUser[];
}
