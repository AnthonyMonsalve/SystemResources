import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Team for all engineers', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
