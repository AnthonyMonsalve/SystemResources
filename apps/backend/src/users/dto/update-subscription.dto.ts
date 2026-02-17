import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsDateString()
  subscriptionStartDate: string;

  @IsDateString()
  subscriptionEndDate: string;

  @IsOptional()
  @IsEnum(['active', 'expired', 'cancelled'])
  subscriptionStatus?: 'active' | 'expired' | 'cancelled';
}
