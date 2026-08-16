import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SuperAdminUser } from './super-admin-user.entity';

/**
 * Hashed refresh tokens so sessions can be revoked (logout / "log out
 * everywhere") instead of relying purely on JWT expiry.
 */
@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @ManyToOne(() => SuperAdminUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: SuperAdminUser;

  @Column({ name: 'user_id' })
  userId: string;

  @Index({ unique: true })
  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;
}
