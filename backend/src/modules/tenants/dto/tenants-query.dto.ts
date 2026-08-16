import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { TenantStatus } from '../../../database/entities/enums';

export class TenantsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
