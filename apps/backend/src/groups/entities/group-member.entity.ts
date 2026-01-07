import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';

@Entity({ name: 'group_members' })
@Unique(['groupId', 'userId'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  groupId: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  group: Group;

  @ManyToOne(() => User, (user) => user.groupMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
