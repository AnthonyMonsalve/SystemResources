import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Routine } from './routine.entity';

@Entity({ name: 'routine_exercises' })
export class RoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  routineId: string;

  @ManyToOne(() => Routine, (routine) => routine.exercises, {
    onDelete: 'CASCADE',
  })
  routine: Routine;

  @Column({ type: 'uuid' })
  exerciseId: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  exercise: Exercise;

  @Column({ type: 'int' })
  order: number; // Order in the routine

  // Override default values
  @Column({ type: 'int', nullable: true })
  sets?: number;

  @Column({ type: 'int', nullable: true })
  reps?: number;

  @Column({ type: 'int', nullable: true })
  duration?: number; // seconds

  @Column({ type: 'int', nullable: true })
  rest?: number; // seconds

  @Column({ type: 'text', nullable: true })
  notes?: string; // Specific notes for this exercise in this routine
}
