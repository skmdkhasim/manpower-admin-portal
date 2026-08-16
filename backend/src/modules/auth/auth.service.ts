import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SuperAdminUser } from '../../database/entities/super-admin-user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(SuperAdminUser)
    private readonly usersRepo: Repository<SuperAdminUser>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepo: Repository<RefreshToken>,
  ) {}

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<SuperAdminUser> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.role', 'role')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  /** Full profile lookup — used by GET /auth/me so it returns the same shape as /auth/login. */
  async getProfile(userId: string): Promise<SuperAdminUser> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: { role: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Account is inactive or no longer exists',
      );
    }
    return user;
  }

  async issueTokens(
    user: SuperAdminUser,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- config value is a validated duration string (e.g. "15m"); upstream types it as a template-literal union `jsonwebtoken` doesn't export.
        expiresIn: this.config.get<string>('jwt.accessExpiresIn') as any,
      },
    );

    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(
      Date.now() + this.config.get<number>('jwt.refreshExpiresInMs')!,
    );

    await this.refreshTokensRepo.save(
      this.refreshTokensRepo.create({
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
      }),
    );

    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async rotateRefreshToken(
    rawRefreshToken: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const existing = await this.refreshTokensRepo.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    if (!existing) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.usersRepo.findOne({
      where: { id: existing.userId },
      relations: { role: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Account is inactive or no longer exists',
      );
    }

    // Rotate: revoke the old refresh token, issue a fresh pair.
    await this.refreshTokensRepo.update(existing.id, { revokedAt: new Date() });
    return this.issueTokens(user, meta);
  }

  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.refreshTokensRepo.update(
      { tokenHash },
      { revokedAt: new Date() },
    );
  }

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    await this.refreshTokensRepo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** Housekeeping: delete refresh tokens that expired a while ago. Safe to call from a cron job. */
  async purgeExpiredTokens(): Promise<void> {
    await this.refreshTokensRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}
