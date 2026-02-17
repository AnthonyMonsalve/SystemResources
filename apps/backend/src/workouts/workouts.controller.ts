import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserProfile } from '../users/entities/user.entity';
import { WorkoutsService } from './workouts.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { LogSetDto } from './dto/log-set.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('sessions')
  async createSession(
    @Body() createDto: CreateSessionDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.workoutsService.createSession(createDto, user);
  }

  @Get('sessions/:id')
  async getSession(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.workoutsService.getSession(id, user);
  }

  @Patch('sessions/:id')
  async updateSession(
    @Param('id') id: string,
    @Body() updateDto: UpdateSessionDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.workoutsService.updateSession(id, updateDto, user);
  }

  @Post('sessions/:sessionId/sets')
  async logSet(
    @Param('sessionId') sessionId: string,
    @Body() logSetDto: LogSetDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.workoutsService.logSet(sessionId, logSetDto, user);
  }

  @Post('sessions/:sessionId/comments')
  async addComment(
    @Param('sessionId') sessionId: string,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.workoutsService.addComment(sessionId, addCommentDto, user);
  }

  @Get('active')
  async getActiveSession(@CurrentUser() user: UserProfile) {
    return this.workoutsService.getActiveSession(user);
  }

  @Get('history')
  async getHistory(
    @Query() queryDto: QuerySessionsDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.workoutsService.getHistory(queryDto, user);
  }
}
