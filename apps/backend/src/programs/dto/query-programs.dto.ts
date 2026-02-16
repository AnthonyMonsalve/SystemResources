import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { FitnessGoal, FitnessLevel } from '../../users/entities/user.entity';

export class QueryProgramsDto {
  @IsOptional()
  @IsEnum(FitnessLevel)
  targetLevel?: FitnessLevel;

  @IsOptional()
  @IsEnum(FitnessGoal)
  targetGoal?: FitnessGoal;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
