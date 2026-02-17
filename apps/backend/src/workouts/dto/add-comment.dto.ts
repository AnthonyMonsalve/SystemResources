import { IsUUID, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { CommentType } from '../entities/workout-comment.entity';

export class AddCommentDto {
  @IsUUID()
  routineExerciseId: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(CommentType)
  @IsOptional()
  type?: CommentType;
}
