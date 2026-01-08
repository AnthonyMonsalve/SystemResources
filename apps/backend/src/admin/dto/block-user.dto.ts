import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class BlockUserDto {
  @ApiPropertyOptional({
    description: 'ISO date to block the user until.',
    example: '2030-01-01T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  blockedUntil?: string;

  @ApiPropertyOptional({
    description: 'Duration to block the user for, in minutes.',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;
}
