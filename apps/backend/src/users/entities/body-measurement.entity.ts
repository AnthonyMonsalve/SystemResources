import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('body_measurements')
export class BodyMeasurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 5, scale: 2 })
  weight: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  height?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  bodyFatPercentage?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  muscleMass?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  chest?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  waist?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  hips?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  arms?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  thighs?: number;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  measurementDate: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

export type BodyMeasurementDto = {
  id: string;
  userId: string;
  weight: number;
  height?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
  measurementDate: Date;
  createdAt: Date;
};
