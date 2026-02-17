import { IsUUID, IsInt, IsNumber, IsBoolean, IsString, IsOptional } from 'class-validator';

export class LogSetDto {
  @IsUUID()
  routineExerciseId: string;

  @IsInt()
  setNumber: number;

  @IsInt()
  @IsOptional()
  repsCompleted?: number;

  @IsInt()
  @IsOptional()
  durationSeconds?: number;

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsBoolean()
  @IsOptional()
  skipped?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
