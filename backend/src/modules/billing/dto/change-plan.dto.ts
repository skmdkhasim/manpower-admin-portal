import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ChangePlanDto {
  @IsUUID()
  planId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
