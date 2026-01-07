import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { MediaFile } from '../../media/entities/media-file.entity';
import { User } from '../../users/entities/user.entity';

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  USER = 'USER',
  GROUP = 'GROUP',
}

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  category?: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ type: 'enum', enum: PostVisibility, default: PostVisibility.PUBLIC })
  visibility: PostVisibility;

  @Column({ type: 'uuid', nullable: true })
  ownerUserId?: string;

  @ManyToOne(() => User, (user) => user.targetedPosts, { onDelete: 'SET NULL' })
  ownerUser?: User;

  @Column({ type: 'uuid', nullable: true })
  groupId?: string;

  @ManyToOne(() => Group, (group) => group.posts, { onDelete: 'CASCADE' })
  group?: Group;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, (user) => user.postsCreated, { onDelete: 'SET NULL' })
  createdBy?: User;

  @OneToMany(() => MediaFile, (media) => media.post, { cascade: ['remove'] })
  mediaFiles?: MediaFile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
