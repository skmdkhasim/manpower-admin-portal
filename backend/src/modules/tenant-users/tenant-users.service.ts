import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantUser } from '../../database/entities/tenant-user.entity';
import { TenantUserStatus } from '../../database/entities/enums';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';

@Injectable()
export class TenantUsersService {
  constructor(
    @InjectRepository(TenantUser)
    private readonly usersRepo: Repository<TenantUser>,
  ) {}

  findAllForTenant(tenantId: string): Promise<TenantUser[]> {
    return this.usersRepo.find({
      where: { tenantId },
      relations: { branch: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<TenantUser> {
    const user = await this.usersRepo.findOne({
      where: { id, tenantId },
      relations: { branch: true },
    });
    if (!user) throw new NotFoundException('Tenant user not found');
    return user;
  }

  create(tenantId: string, dto: CreateTenantUserDto): Promise<TenantUser> {
    const user = this.usersRepo.create({
      ...dto,
      tenantId,
      status: TenantUserStatus.INVITED,
      invitedAt: new Date(),
    });
    return this.usersRepo.save(user);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateTenantUserDto,
  ): Promise<TenantUser> {
    const user = await this.findOne(tenantId, id);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const user = await this.findOne(tenantId, id);
    await this.usersRepo.remove(user);
  }
}
