import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';
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

  async findClientsByTrainerId(trainerId: string): Promise<UserProfile[]> {
    const clients = await this.usersRepository.find({
      where: { trainerId, role: UserRole.CLIENT },
      order: { name: 'ASC' },
    });
    return clients.map((client) => this.sanitize(client));
  }

  async findClientById(clientId: string, trainerId: string): Promise<UserProfile> {
    const client = await this.usersRepository.findOne({
      where: { id: clientId, trainerId, role: UserRole.CLIENT },
    });
    if (!client) {
      throw new UnauthorizedException('Client not found or access denied');
    }
    return this.sanitize(client);
  }

  async inviteClient(email: string, trainerId: string): Promise<UserProfile> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Generate a temporary password (in production, send email with setup link)
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const client = this.usersRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.CLIENT,
      trainerId,
    });

    const saved = await this.usersRepository.save(client);

    // TODO: Send email with temporary password or setup link
    console.log(`Client invited: ${email} with temp password: ${tempPassword}`);

    return this.sanitize(saved);
  }

  async updateClientSubscription(
    clientId: string,
    trainerId: string,
    subscriptionData: {
      subscriptionStartDate: Date;
      subscriptionEndDate: Date;
      subscriptionStatus?: 'active' | 'expired' | 'cancelled';
    },
  ): Promise<UserProfile> {
    const client = await this.usersRepository.findOne({
      where: { id: clientId, trainerId, role: UserRole.CLIENT },
    });

    if (!client) {
      throw new UnauthorizedException('Client not found or access denied');
    }

    // Auto-set status based on dates if not provided
    const now = new Date();
    let status = subscriptionData.subscriptionStatus;
    if (!status) {
      if (subscriptionData.subscriptionEndDate < now) {
        status = 'expired';
      } else if (subscriptionData.subscriptionStartDate <= now) {
        status = 'active';
      } else {
        status = 'active'; // Future subscription
      }
    }

    client.subscriptionStartDate = subscriptionData.subscriptionStartDate;
    client.subscriptionEndDate = subscriptionData.subscriptionEndDate;
    client.subscriptionStatus = status;

    const saved = await this.usersRepository.save(client);
    return this.sanitize(saved);
  }

  async getClientsWithExpiringSoonSubscriptions(
    trainerId: string,
    daysThreshold: number = 7,
  ): Promise<UserProfile[]> {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);

    const clients = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.trainerId = :trainerId', { trainerId })
      .andWhere('user.role = :role', { role: UserRole.CLIENT })
      .andWhere('user.subscriptionEndDate IS NOT NULL')
      .andWhere('user.subscriptionEndDate > :now', { now })
      .andWhere('user.subscriptionEndDate <= :threshold', {
        threshold: thresholdDate,
      })
      .andWhere("user.subscriptionStatus != 'cancelled'")
      .orderBy('user.subscriptionEndDate', 'ASC')
      .getMany();

    return clients.map((client) => this.sanitize(client));
  }

  async updateClientProfile(
    userId: string,
    dto: UpdateClientProfileDto,
  ): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, role: UserRole.CLIENT },
    });

    if (!user) {
      throw new NotFoundException('Client not found');
    }

    if (dto.weight !== undefined) {
      user.weight = dto.weight;
    }
    if (dto.height !== undefined) {
      user.height = dto.height;
    }
    if (dto.goal !== undefined) {
      user.goal = dto.goal;
    }
    if (dto.fitnessLevel !== undefined) {
      user.fitnessLevel = dto.fitnessLevel;
    }

    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async updateTrainerProfile(
    userId: string,
    dto: UpdateTrainerProfileDto,
  ): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, role: UserRole.TRAINER },
    });

    if (!user) {
      throw new NotFoundException('Trainer not found');
    }

    if (dto.bio !== undefined) {
      user.bio = dto.bio;
    }
    if (dto.specialization !== undefined) {
      user.specialization = dto.specialization;
    }
    if (dto.certifications !== undefined) {
      user.certifications = dto.certifications;
    }
    if (dto.yearsExperience !== undefined) {
      user.yearsExperience = dto.yearsExperience;
    }

    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  sanitize(user: User): UserProfile {
    // Password hash is excluded by design; ensure rest of properties stay typed.
    const { passwordHash, groupMemberships, postsCreated, targetedPosts, ...rest } =
      user;
    return rest as UserProfile;
  }
}
