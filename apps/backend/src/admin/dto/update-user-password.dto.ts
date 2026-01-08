import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({ example: 'newStrongPassword123' })
  @IsString()
  @MinLength(6)
  password: string;
}
