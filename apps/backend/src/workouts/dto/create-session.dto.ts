import { IsUUID, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  routineId: string;

  @IsUUID()
  @IsOptional()
  programId?: string;
}
