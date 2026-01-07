import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMember } from './group-member.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => GroupMember, (member) => member.group, {
    cascade: ['remove'],
  })
  members?: GroupMember[];

  @OneToMany(() => Post, (post) => post.group)
  posts?: Post[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
