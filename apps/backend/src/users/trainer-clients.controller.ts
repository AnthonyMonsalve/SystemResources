import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { InviteClientDto } from './dto/invite-client.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import type { UserProfile } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Trainer Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRAINER, UserRole.ADMIN)
@Controller('trainer')
export class TrainerClientsController {
  constructor(private readonly usersService: UsersService) {}

  @Get('clients')
  async getMyClients(@CurrentUser() user: UserProfile): Promise<UserProfile[]> {
    return this.usersService.findClientsByTrainerId(user.id);
  }

  @Get('clients/:clientId')
  async getClientById(
    @Param('clientId') clientId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.findClientById(clientId, user.id);
  }

  @Post('invite-client')
  async inviteClient(
    @Body() inviteDto: InviteClientDto,
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.inviteClient(inviteDto.email, user.id);
  }

  @Patch('clients/:clientId/subscription')
  async updateClientSubscription(
    @Param('clientId') clientId: string,
    @Body() subscriptionDto: UpdateSubscriptionDto,
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile> {
    return this.usersService.updateClientSubscription(clientId, user.id, {
      subscriptionStartDate: new Date(subscriptionDto.subscriptionStartDate),
      subscriptionEndDate: new Date(subscriptionDto.subscriptionEndDate),
      subscriptionStatus: subscriptionDto.subscriptionStatus,
    });
  }

  @Get('subscriptions/expiring-soon')
  async getExpiringSoonSubscriptions(
    @CurrentUser() user: UserProfile,
  ): Promise<UserProfile[]> {
    return this.usersService.getClientsWithExpiringSoonSubscriptions(user.id);
  }
}
