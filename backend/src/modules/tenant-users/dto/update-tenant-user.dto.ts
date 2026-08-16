import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTenantUserDto } from './create-tenant-user.dto';
import { TenantUserStatus } from '../../../database/entities/enums';

export class UpdateTenantUserDto extends PartialType(CreateTenantUserDto) {
  @IsOptional()
  @IsEnum(TenantUserStatus)
  status?: TenantUserStatus;
}
