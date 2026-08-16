import { IsEnum } from 'class-validator';
import { TenantOnboardingStep } from '../../../database/entities/enums';

export class UpdateOnboardingStepDto {
  @IsEnum(TenantOnboardingStep)
  step: TenantOnboardingStep;
}
