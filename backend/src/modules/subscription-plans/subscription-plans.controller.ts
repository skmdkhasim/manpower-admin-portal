import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly plansService: SubscriptionPlansService) {}

  @Get()
  @RequirePermissions('billing.read')
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @RequirePermissions('billing.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.findOne(id);
  }

  @Post()
  @RequirePermissions('billing.write')
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('billing.write')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('billing.write')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.remove(id);
  }
}
