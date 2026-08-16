import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  dueDate: string;
}
