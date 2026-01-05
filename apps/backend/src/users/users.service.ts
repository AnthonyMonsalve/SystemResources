import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserProfile, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  async create(dto: CreateUserDto): Promise<UserProfile> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = dto.role ?? UserRole.CLIENT;
    const user: User = {
      id: randomUUID(),
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      role,
    };
    this.users.push(user);
    return this.sanitize(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email.toLowerCase());
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserProfile> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.sanitize(user);
  }

  sanitize(user: User): UserProfile {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
