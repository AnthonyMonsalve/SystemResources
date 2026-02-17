import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutStatus } from '../entities/workout-session.entity';

export class QuerySessionsDto {
  @IsEnum(WorkoutStatus)
  @IsOptional()
  status?: WorkoutStatus;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
