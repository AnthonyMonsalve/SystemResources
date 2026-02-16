import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TrainingProgram } from '../../programs/entities/training-program.entity';
import { User } from '../../users/entities/user.entity';
import { RoutineExercise } from './routine-exercise.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity({ name: 'routines' })
export class Routine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => RoutineExercise, (re) => re.routine, { cascade: true })
  exercises: RoutineExercise[];

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    nullable: true,
  })
  dayOfWeek?: DayOfWeek;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean; // For feed público

  @Column({ type: 'uuid', nullable: true })
  programId?: string;

  @ManyToOne(() => TrainingProgram, (program) => program.routines, {
    onDelete: 'SET NULL',
  })
  program?: TrainingProgram;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
