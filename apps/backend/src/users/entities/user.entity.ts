import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { GroupMember } from '../../groups/entities/group-member.entity';
import { Post } from '../../posts/entities/post.entity';

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum FitnessGoal {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_MUSCLE = 'gain_muscle',
  IMPROVE_ENDURANCE = 'improve_endurance',
  GENERAL_FITNESS = 'general_fitness',
  REHABILITATION = 'rehabilitation',
}

export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  CLIENT = 'client',
  USER = 'user', // Deprecated - mantener para compatibilidad
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'timestamptz', nullable: true })
  blockedUntil?: Date | null;

  // Trainer Profile Fields
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialization?: string;

  @Column({ type: 'text', nullable: true })
  certifications?: string;

  @Column({ type: 'int', nullable: true })
  yearsExperience?: number;

  // Client Profile Fields
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number; // kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height?: number; // cm

  @Column({
    type: 'enum',
    enum: FitnessGoal,
    nullable: true,
  })
  goal?: FitnessGoal;

  @Column({
    type: 'enum',
    enum: FitnessLevel,
    nullable: true,
  })
  fitnessLevel?: FitnessLevel;

  @Column({ type: 'uuid', nullable: true })
  trainerId?: string;

  @ManyToOne(() => User, (user) => user.clients)
  trainer?: User;

  @OneToMany(() => User, (user) => user.trainer)
  clients?: User[];

  @OneToMany(() => GroupMember, (membership) => membership.user)
  groupMemberships?: GroupMember[];

  @OneToMany(() => Post, (post) => post.createdBy)
  postsCreated?: Post[];

  @OneToMany(() => Post, (post) => post.ownerUser)
  targetedPosts?: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments?: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export type UserProfile = Pick<
  User,
  | 'id'
  | 'email'
  | 'name'
  | 'role'
  | 'blockedUntil'
  | 'createdAt'
  | 'updatedAt'
  // Trainer fields
  | 'bio'
  | 'specialization'
  | 'certifications'
  | 'yearsExperience'
  // Client fields
  | 'weight'
  | 'height'
  | 'goal'
  | 'fitnessLevel'
  | 'trainerId'
>;
