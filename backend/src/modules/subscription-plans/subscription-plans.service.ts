import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly plansRepo: Repository<SubscriptionPlan>,
  ) {}

  findAll(): Promise<SubscriptionPlan[]> {
    return this.plansRepo.find({ order: { price: 'ASC' } });
  }

  async findOne(id: string): Promise<SubscriptionPlan> {
    const plan = await this.plansRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  create(dto: CreatePlanDto): Promise<SubscriptionPlan> {
    const plan = this.plansRepo.create({
      ...dto,
      features: dto.features ?? [],
    });
    return this.plansRepo.save(plan);
  }

  async update(id: string, dto: UpdatePlanDto): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.plansRepo.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.plansRepo.remove(plan);
  }
}
