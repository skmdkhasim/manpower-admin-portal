import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateOnboardingStepDto } from './dto/onboarding-step.dto';
import { TenantsQueryDto } from './dto/tenants-query.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @RequirePermissions('tenants.read')
  list(@Query() query: TenantsQueryDto) {
    return this.tenantsService.list(query);
  }

  @Get(':id')
  @RequirePermissions('tenants.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @RequirePermissions('tenants.write')
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('tenants.write')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Patch(':id/onboarding-step')
  @RequirePermissions('tenants.write')
  updateOnboardingStep(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnboardingStepDto,
  ) {
    return this.tenantsService.updateOnboardingStep(id, dto.step);
  }

  @Post(':id/suspend')
  @RequirePermissions('tenants.write')
  suspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.suspend(id);
  }

  @Post(':id/reactivate')
  @RequirePermissions('tenants.write')
  reactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.reactivate(id);
  }

  @Delete(':id')
  @RequirePermissions('tenants.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.remove(id);
  }
}
