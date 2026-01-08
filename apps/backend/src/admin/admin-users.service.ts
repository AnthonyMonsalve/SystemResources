import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AdminUserDto } from './dto/admin-user.dto';
import { BlockUserDto } from './dto/block-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async list(): Promise<AdminUserDto[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => this.toAdminDto(user));
  }

  async remove(userId: string, actorUserId: string): Promise<void> {
    if (userId === actorUserId) {
      throw new BadRequestException('Cannot delete the current user');
    }
    const user = await this.findUserOrFail(userId);
    await this.usersRepository.remove(user);
  }

  async updatePassword(userId: string, password: string): Promise<AdminUserDto> {
    const user = await this.findUserOrFail(userId);
    user.passwordHash = await bcrypt.hash(password, 10);
    const saved = await this.usersRepository.save(user);
    return this.toAdminDto(saved);
  }

  async blockUser(
    userId: string,
    dto: BlockUserDto,
    actorUserId: string,
  ): Promise<AdminUserDto> {
    if (userId === actorUserId) {
      throw new BadRequestException('Cannot block the current user');
    }
    const user = await this.findUserOrFail(userId);
    user.blockedUntil = this.resolveBlockedUntil(dto);
    const saved = await this.usersRepository.save(user);
    return this.toAdminDto(saved);
  }

  private resolveBlockedUntil(dto: BlockUserDto): Date {
    if (dto.blockedUntil) {
      const date = new Date(dto.blockedUntil);
      if (Number.isNaN(date.getTime())) {
        throw new BadRequestException('blockedUntil must be a valid date');
      }
      return date;
    }
    if (dto.durationMinutes !== undefined) {
      return new Date(Date.now() + dto.durationMinutes * 60_000);
    }
    throw new BadRequestException(
      'Either blockedUntil or durationMinutes is required',
    );
  }

  private isBlocked(user: User): boolean {
    if (!user.blockedUntil) {
      return false;
    }
    return user.blockedUntil.getTime() > Date.now();
  }

  private toAdminDto(user: User): AdminUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      blockedUntil: user.blockedUntil ?? null,
      isBlocked: this.isBlocked(user),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async findUserOrFail(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
