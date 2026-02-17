import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkoutSession } from './workout-session.entity';
import { RoutineExercise } from '../../routines/entities/routine-exercise.entity';

export enum CommentType {
  QUESTION = 'question',
  ISSUE = 'issue',
  NOTE = 'note',
}

@Entity({ name: 'workout_comments' })
export class WorkoutComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => WorkoutSession, (session) => session.comments, {
    onDelete: 'CASCADE',
  })
  session: WorkoutSession;

  @Column({ type: 'uuid' })
  routineExerciseId: string;

  @ManyToOne(() => RoutineExercise, { onDelete: 'SET NULL', nullable: true })
  routineExercise: RoutineExercise;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentType,
    default: CommentType.NOTE,
  })
  type: CommentType;

  @CreateDateColumn()
  createdAt: Date;
}
