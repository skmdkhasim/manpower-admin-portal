import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminsService } from './super-admins.service';
import { SuperAdminsController } from './super-admins.controller';
import { SuperAdminUser } from '../../database/entities/super-admin-user.entity';
import { Role } from '../../database/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SuperAdminUser, Role])],
  controllers: [SuperAdminsController],
  providers: [SuperAdminsService],
})
export class SuperAdminsModule {}
