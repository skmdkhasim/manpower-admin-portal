import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { TenantBranch } from '../../database/entities/tenant-branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantBranch])],
  controllers: [BranchesController],
  providers: [BranchesService],
})
export class BranchesModule {}
