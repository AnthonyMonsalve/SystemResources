import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateMeasurementDto {
  @IsNumber()
  @Min(20)
  @Max(300)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bodyFatPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  muscleMass?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  chest?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  waist?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  hips?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  arms?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(150)
  thighs?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsDateString()
  measurementDate?: string;
}
