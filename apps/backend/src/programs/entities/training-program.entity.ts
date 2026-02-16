import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Routine } from '../../routines/entities/routine.entity';
import { FitnessGoal, FitnessLevel, User } from '../../users/entities/user.entity';
import { ProgramClient } from './program-client.entity';

@Entity({ name: 'training_programs' })
export class TrainingProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  durationWeeks: number; // Duration in weeks

  @OneToMany(() => Routine, (routine) => routine.program)
  routines: Routine[];

  @Column({
    type: 'enum',
    enum: FitnessLevel,
    nullable: true,
  })
  targetLevel?: FitnessLevel;

  @Column({
    type: 'enum',
    enum: FitnessGoal,
    nullable: true,
  })
  targetGoal?: FitnessGoal;

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean; // Generic template vs personalized

  @OneToMany(() => ProgramClient, (pc) => pc.program, { cascade: true })
  assignedClients: ProgramClient[];

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
