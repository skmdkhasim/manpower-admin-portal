import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdminUser } from '../../../database/entities/super-admin-user.entity';
import { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(SuperAdminUser)
    private readonly usersRepo: Repository<SuperAdminUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersRepo.findOne({
      where: { id: payload.sub },
      relations: { role: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Account is inactive or no longer exists',
      );
    }
    return {
      userId: user.id,
      email: user.email,
      roleName: user.role.name,
      permissions: user.role.permissions,
    };
  }
}
