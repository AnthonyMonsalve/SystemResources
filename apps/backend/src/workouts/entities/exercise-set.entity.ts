import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkoutSession } from './workout-session.entity';
import { RoutineExercise } from '../../routines/entities/routine-exercise.entity';

@Entity({ name: 'exercise_sets' })
export class ExerciseSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => WorkoutSession, (session) => session.sets, {
    onDelete: 'CASCADE',
  })
  session: WorkoutSession;

  @Column({ type: 'uuid' })
  routineExerciseId: string;

  @ManyToOne(() => RoutineExercise, { onDelete: 'SET NULL', nullable: true })
  routineExercise: RoutineExercise;

  @Column({ type: 'int' })
  setNumber: number;

  @Column({ type: 'int', nullable: true })
  repsCompleted?: number;

  @Column({ type: 'int', nullable: true })
  durationSeconds?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weightKg?: number;

  @Column({ type: 'boolean', default: true })
  completed: boolean;

  @Column({ type: 'boolean', default: false })
  skipped: boolean;

  @Column({ type: 'timestamptz' })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
