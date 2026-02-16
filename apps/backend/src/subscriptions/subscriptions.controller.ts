import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserProfile } from '../users/entities/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  create(
    @Body() dto: CreateSubscriptionDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.subscriptionsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions (filtered by role)' })
  findAll(
    @Query() query: QuerySubscriptionsDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.subscriptionsService.findAll(query, user);
  }

  @Get('expiring-soon')
  @ApiOperation({ summary: 'Get subscriptions expiring in the next 7 days' })
  getExpiringSoon(@CurrentUser() user: UserProfile) {
    return this.subscriptionsService.getExpiringSoon(user, 7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.subscriptionsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubscriptionDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.subscriptionsService.update(id, dto, user);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Register payment and extend subscription' })
  registerPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.subscriptionsService.registerPayment(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.subscriptionsService.cancel(id, user);
  }
}
