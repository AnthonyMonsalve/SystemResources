import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';
import type { UserProfile } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getMyProfile(@CurrentUser() user: UserProfile): Promise<UserProfile> {
    // Return current user profile (already available from JWT)
    return user;
  }

  @Patch('client')
  @Roles(UserRole.CLIENT)
  async updateClientProfile(
    @Body() dto: UpdateClientProfileDto,
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.updateClientProfile(user.id, dto);
  }

  @Patch('trainer')
  @Roles(UserRole.TRAINER)
  async updateTrainerProfile(
    @Body() dto: UpdateTrainerProfileDto,
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.updateTrainerProfile(user.id, dto);
  }
}
