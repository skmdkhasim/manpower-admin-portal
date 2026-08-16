import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantBranch } from '../../database/entities/tenant-branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(TenantBranch)
    private readonly branchesRepo: Repository<TenantBranch>,
  ) {}

  findAllForTenant(tenantId: string): Promise<TenantBranch[]> {
    return this.branchesRepo.find({
      where: { tenantId },
      order: { isHeadOffice: 'DESC', name: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<TenantBranch> {
    const branch = await this.branchesRepo.findOne({ where: { id, tenantId } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  create(tenantId: string, dto: CreateBranchDto): Promise<TenantBranch> {
    const branch = this.branchesRepo.create({ ...dto, tenantId });
    return this.branchesRepo.save(branch);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateBranchDto,
  ): Promise<TenantBranch> {
    const branch = await this.findOne(tenantId, id);
    Object.assign(branch, dto);
    return this.branchesRepo.save(branch);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const branch = await this.findOne(tenantId, id);
    await this.branchesRepo.remove(branch);
  }
}
