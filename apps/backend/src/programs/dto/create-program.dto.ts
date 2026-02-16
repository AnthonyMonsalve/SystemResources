import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FitnessGoal, FitnessLevel } from '../../users/entities/user.entity';

export class CreateProgramDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(104) // Max 2 years
  durationWeeks: number;

  @IsOptional()
  @IsEnum(FitnessLevel)
  targetLevel?: FitnessLevel;

  @IsOptional()
  @IsEnum(FitnessGoal)
  targetGoal?: FitnessGoal;

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  routineIds?: string[];
}
