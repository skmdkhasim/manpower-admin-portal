import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { BillingCycle } from '../../../database/entities/enums';

export class CreatePlanDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  code: string;

  @IsNumberString()
  price: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsInt()
  @Min(1)
  maxUsers: number;

  @IsInt()
  @Min(1)
  maxBranches: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}
