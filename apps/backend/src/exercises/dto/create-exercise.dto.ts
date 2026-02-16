import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { EquipmentType, ExerciseDifficulty, MuscleGroup } from '../entities/exercise.entity';

export class CreateExerciseDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  thumbnailUrl?: string;

  @IsNotEmpty()
  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;

  @IsNotEmpty()
  @IsEnum(EquipmentType)
  equipment: EquipmentType;

  @IsNotEmpty()
  @IsEnum(ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  defaultSets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  defaultReps?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(86400) // Max 24 hours in seconds
  defaultDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3600) // Max 1 hour rest
  defaultRest?: number;
}
