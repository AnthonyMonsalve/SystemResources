import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProfile, UserRole } from '../users/entities/user.entity';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupMember } from './entities/group-member.entity';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMembersRepository: Repository<GroupMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateGroupDto): Promise<Group> {
    const existing = await this.groupsRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Group name already exists');
    }
    const group = this.groupsRepository.create(dto);
    return this.groupsRepository.save(group);
  }

  async update(id: string, dto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    if (dto.name && dto.name !== group.name) {
      const existing = await this.groupsRepository.findOne({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Group name already exists');
      }
    }
    Object.assign(group, dto);
    return this.groupsRepository.save(group);
  }

  async remove(id: string): Promise<void> {
    const result = await this.groupsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Group not found');
    }
  }

  async addMember(groupId: string, dto: AddGroupMemberDto): Promise<GroupMember> {
    const group = await this.groupsRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const user = await this.usersRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.groupMembersRepository.findOne({
      where: { groupId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User already in group');
    }
    const membership = this.groupMembersRepository.create({
      groupId,
      userId: dto.userId,
      group,
      user,
    });
    return this.groupMembersRepository.save(membership);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    const existing = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Membership not found');
    }
    await this.groupMembersRepository.remove(existing);
  }

  async findOneForUser(id: string, currentUser: UserProfile): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    if (currentUser.role !== UserRole.ADMIN) {
      const isMember =
        group.members?.some((member) => member.userId === currentUser.id) ??
        false;
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this group');
      }
    }
    return group;
  }

  async findAllForUser(currentUser: UserProfile): Promise<Group[]> {
    const qb = this.groupsRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'member')
      .leftJoinAndSelect('member.user', 'memberUser');

    if (currentUser.role !== UserRole.ADMIN) {
      qb.where('member.userId = :userId', { userId: currentUser.id });
    }

    return qb.getMany();
  }
}
