import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTenantDto } from './create-tenant.dto';
import { TenantStatus } from '../../../database/entities/enums';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
