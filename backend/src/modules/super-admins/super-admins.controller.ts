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
import { SuperAdminsService } from './super-admins.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('super-admins')
export class SuperAdminsController {
  constructor(private readonly superAdminsService: SuperAdminsService) {}

  @Get()
  @RequirePermissions('admins.read')
  findAll() {
    return this.superAdminsService.findAll();
  }

  @Get('roles')
  @RequirePermissions('admins.read')
  listRoles() {
    return this.superAdminsService.listRoles();
  }

  @Get(':id')
  @RequirePermissions('admins.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminsService.findOne(id);
  }

  @Post()
  @RequirePermissions('admins.write')
  create(@Body() dto: CreateSuperAdminDto) {
    return this.superAdminsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('admins.write')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSuperAdminDto,
  ) {
    return this.superAdminsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('admins.write')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminsService.remove(id);
  }
}
