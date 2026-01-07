import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PostVisibility } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'Release notes' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({ example: 'Details about the new release' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'announcement' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'product' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String], example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((o) => o.visibility === PostVisibility.USER)
  @IsUUID()
  ownerUserId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((o) => o.visibility === PostVisibility.GROUP)
  @IsUUID()
  groupId?: string;
}
