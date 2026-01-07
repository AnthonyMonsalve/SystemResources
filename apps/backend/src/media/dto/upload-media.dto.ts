import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({ example: 'Screenshot' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'UI mockup' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'image' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String], example: ['ui', 'v1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  postId: string;
}
