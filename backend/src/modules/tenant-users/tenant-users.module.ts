import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantUsersService } from './tenant-users.service';
import { TenantUsersController } from './tenant-users.controller';
import { TenantUser } from '../../database/entities/tenant-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantUser])],
  controllers: [TenantUsersController],
  providers: [TenantUsersService],
})
export class TenantUsersModule {}
