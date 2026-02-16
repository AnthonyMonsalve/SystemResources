import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class AddExerciseToRoutineDto {
  @IsNotEmpty()
  @IsUUID()
  exerciseId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  order: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  sets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  reps?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(86400)
  duration?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3600)
  rest?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
