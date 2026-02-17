import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Routine } from '../../routines/entities/routine.entity';
import { TrainingProgram } from '../../programs/entities/training-program.entity';
import { ExerciseSet } from './exercise-set.entity';
import { WorkoutComment } from './workout-comment.entity';

export enum WorkoutStatus {
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity({ name: 'workout_sessions' })
export class WorkoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid' })
  routineId: string;

  @ManyToOne(() => Routine, { onDelete: 'SET NULL', nullable: true })
  routine: Routine;

  @Column({ type: 'uuid', nullable: true })
  programId?: string;

  @ManyToOne(() => TrainingProgram, { onDelete: 'SET NULL', nullable: true })
  program?: TrainingProgram;

  @Column({
    type: 'enum',
    enum: WorkoutStatus,
    default: WorkoutStatus.IN_PROGRESS,
  })
  status: WorkoutStatus;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  pausedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalDurationSeconds: number;

  @Column({ type: 'int', default: 0 })
  currentExerciseIndex: number;

  @Column({ type: 'int', default: 1 })
  currentSetNumber: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => ExerciseSet, (set) => set.session, { cascade: true })
  sets: ExerciseSet[];

  @OneToMany(() => WorkoutComment, (comment) => comment.session, {
    cascade: true,
  })
  comments: WorkoutComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
