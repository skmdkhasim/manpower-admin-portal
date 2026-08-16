import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { SuperAdminUser } from '../../database/entities/super-admin-user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([SuperAdminUser, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        // `expiresIn` accepts vitals like "15m" but is typed as a template-literal
        // union upstream; ConfigService only knows `string`, hence the cast.
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- config value is a validated duration string (e.g. "15m"); upstream types it as a template-literal union `jsonwebtoken` doesn't export.
          expiresIn: config.get<string>('jwt.accessExpiresIn') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Applied globally: every route requires a valid JWT unless @Public(),
    // then every route additionally checks @RequirePermissions() if present.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
