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
import { TenantUsersService } from './tenant-users.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto } from './dto/update-tenant-user.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('tenants/:tenantId/users')
export class TenantUsersController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Get()
  @RequirePermissions('tenants.read')
  findAll(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.tenantUsersService.findAllForTenant(tenantId);
  }

  @Get(':id')
  @RequirePermissions('tenants.read')
  findOne(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tenantUsersService.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions('tenants.write')
  create(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: CreateTenantUserDto,
  ) {
    return this.tenantUsersService.create(tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions('tenants.write')
  update(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantUserDto,
  ) {
    return this.tenantUsersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('tenants.write')
  remove(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tenantUsersService.remove(tenantId, id);
  }
}
