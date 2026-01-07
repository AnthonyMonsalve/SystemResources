import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

@Entity({ name: 'media_files' })
export class MediaFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  category?: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column()
  url: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @ManyToOne(() => Post, (post) => post.mediaFiles, { onDelete: 'CASCADE' })
  post: Post;

  @Column('uuid')
  postId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
