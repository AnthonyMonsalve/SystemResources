import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserProfile } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const token = this.signToken(user);
    return { access_token: token, user };
  }

  async validateUser(loginDto: LoginDto): Promise<UserProfile> {
    return this.usersService.validateCredentials(loginDto.email, loginDto.password);
  }

  async login(user: UserProfile) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const token = this.signToken(user);
    return { access_token: token, user };
  }

  async profile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.usersService.sanitize(user);
  }

  private signToken(user: UserProfile): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
