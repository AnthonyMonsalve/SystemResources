import { IsEnum, IsInt, IsString, IsOptional } from 'class-validator';
import { WorkoutStatus } from '../entities/workout-session.entity';

export class UpdateSessionDto {
  @IsEnum(WorkoutStatus)
  @IsOptional()
  status?: WorkoutStatus;

  @IsInt()
  @IsOptional()
  currentExerciseIndex?: number;

  @IsInt()
  @IsOptional()
  currentSetNumber?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @IsOptional()
  totalDurationSeconds?: number;
}
