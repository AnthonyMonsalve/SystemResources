import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMember } from '../../groups/entities/group-member.entity';
import { Post } from '../../posts/entities/post.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
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

  @OneToMany(() => GroupMember, (membership) => membership.user)
  groupMemberships?: GroupMember[];

  @OneToMany(() => Post, (post) => post.createdBy)
  postsCreated?: Post[];

  @OneToMany(() => Post, (post) => post.ownerUser)
  targetedPosts?: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export type UserProfile = Pick<
  User,
  'id' | 'email' | 'name' | 'role' | 'createdAt' | 'updatedAt'
>;
