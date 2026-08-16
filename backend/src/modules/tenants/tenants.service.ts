import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import slugify from 'slugify';
import { Tenant } from '../../database/entities/tenant.entity';
import {
  TenantOnboardingStep,
  TenantStatus,
} from '../../database/entities/enums';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsQueryDto } from './dto/tenants-query.dto';
import { Paginated } from '../../common/dto/pagination.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepo: Repository<Tenant>,
  ) {}

  async list(query: TenantsQueryDto): Promise<Paginated<Tenant>> {
    const { page, pageSize, search, status } = query;
    const statusFilter: FindOptionsWhere<Tenant> = status ? { status } : {};
    const where: FindOptionsWhere<Tenant> | FindOptionsWhere<Tenant>[] = search
      ? [
          { ...statusFilter, name: ILike(`%${search}%`) },
          { ...statusFilter, contactEmail: ILike(`%${search}%`) },
        ]
      : statusFilter;
    const [items, total] = await this.tenantsRepo.findAndCount({
      where,
      // Small tenant counts expected in v1 — eager-loading these relations
      // for a ≤pageSize list is cheap and lets the list screen show branch/
      // user counts and the active plan without N+1 follow-up requests.
      relations: { branches: true, users: true, subscriptions: { plan: true } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepo.findOne({
      where: { id },
      relations: { branches: true, users: true, subscriptions: { plan: true } },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const slug = await this.generateUniqueSlug(dto.name);
    const tenant = this.tenantsRepo.create({
      ...dto,
      slug,
      status: TenantStatus.ONBOARDING,
      onboardingStep: TenantOnboardingStep.COMPANY_DETAILS,
    });
    return this.tenantsRepo.save(tenant);
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, dto);
    return this.tenantsRepo.save(tenant);
  }

  async updateOnboardingStep(
    id: string,
    step: TenantOnboardingStep,
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.onboardingStep = step;
    if (step === TenantOnboardingStep.COMPLETE) {
      tenant.status = TenantStatus.ACTIVE;
    }
    return this.tenantsRepo.save(tenant);
  }

  async suspend(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.SUSPENDED;
    return this.tenantsRepo.save(tenant);
  }

  async reactivate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.ACTIVE;
    return this.tenantsRepo.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantsRepo.remove(tenant);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name, { lower: true, strict: true });
    let candidate = base;
    let suffix = 1;
    // Small tenant counts expected in v1; a loop here is fine.
    while (await this.tenantsRepo.exist({ where: { slug: candidate } })) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    if (!candidate)
      throw new ConflictException('Could not derive a slug from tenant name');
    return candidate;
  }
}
