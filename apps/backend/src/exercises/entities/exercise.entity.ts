import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  LEGS = 'legs',
  CORE = 'core',
  FULL_BODY = 'full_body',
  CARDIO = 'cardio',
}

export enum EquipmentType {
  NONE = 'none', // Bodyweight
  DUMBBELLS = 'dumbbells',
  BARBELL = 'barbell',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BAND = 'resistance_band',
  MACHINE = 'machine',
  CABLE = 'cable',
  OTHER = 'other',
}

export enum ExerciseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity({ name: 'exercises' })
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({
    type: 'enum',
    enum: MuscleGroup,
  })
  muscleGroup: MuscleGroup;

  @Column({
    type: 'enum',
    enum: EquipmentType,
    default: EquipmentType.NONE,
  })
  equipment: EquipmentType;

  @Column({
    type: 'enum',
    enum: ExerciseDifficulty,
    default: ExerciseDifficulty.BEGINNER,
  })
  difficulty: ExerciseDifficulty;

  // Default values (can be overridden in routines)
  @Column({ type: 'int', nullable: true })
  defaultSets?: number;

  @Column({ type: 'int', nullable: true })
  defaultReps?: number;

  @Column({ type: 'int', nullable: true })
  defaultDuration?: number; // seconds

  @Column({ type: 'int', nullable: true })
  defaultRest?: number; // seconds between sets

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
