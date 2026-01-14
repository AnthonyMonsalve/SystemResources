import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID, ValidateIf } from 'class-validator';

export class AddGroupMemberDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((o) => !o.userIds?.length)
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ format: 'uuid', isArray: true })
  @ValidateIf((o) => !o.userId)
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userIds?: string[];
}
