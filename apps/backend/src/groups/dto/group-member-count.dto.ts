import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupMemberCountDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Equipo de contenido' })
  name: string;

  @ApiPropertyOptional({ example: 'Grupo de trabajo interno' })
  description?: string | null;

  @ApiProperty({ example: 3 })
  membersCount: number;

  @ApiProperty({ example: '2026-01-14T06:34:21.219Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-01-14T06:34:21.219Z' })
  updatedAt: string;
}
