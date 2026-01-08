import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserProfile, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserProfile> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = dto.role ?? UserRole.USER;
    const user = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      role,
    });
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      select: [
        'id',
        'email',
        'name',
        'role',
        'blockedUntil',
        'passwordHash',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? this.sanitize(user) : null;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserProfile> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (this.isBlocked(user)) {
      throw new ForbiddenException('User is temporarily blocked');
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.sanitize(user);
  }

  isBlocked(user: UserProfile): boolean {
    if (!user.blockedUntil) {
      return false;
    }
    return user.blockedUntil.getTime() > Date.now();
  }

  sanitize(user: User): UserProfile {
    // Password hash is excluded by design; ensure rest of properties stay typed.
    const { passwordHash, groupMemberships, postsCreated, targetedPosts, ...rest } =
      user;
    return rest as UserProfile;
  }
}
