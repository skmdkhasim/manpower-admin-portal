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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('tenants/:tenantId/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @RequirePermissions('tenants.read')
  findAll(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.branchesService.findAllForTenant(tenantId);
  }

  @Get(':id')
  @RequirePermissions('tenants.read')
  findOne(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchesService.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions('tenants.write')
  create(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.branchesService.create(tenantId, dto);
  }

  @Patch(':id')
  @RequirePermissions('tenants.write')
  update(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('tenants.write')
  remove(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchesService.remove(tenantId, id);
  }
}
