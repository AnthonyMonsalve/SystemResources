import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TrainingProgram } from './training-program.entity';

@Entity({ name: 'program_clients' })
export class ProgramClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => TrainingProgram, (program) => program.assignedClients, {
    onDelete: 'CASCADE',
  })
  program: TrainingProgram;

  @Column({ type: 'uuid' })
  clientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  client: User;

  @Column({ type: 'timestamptz' })
  assignedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
