import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  @Post('sessions/:sessionId/photos')
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: './uploads/workout-photos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `workout-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPhotos(
    @Param('sessionId') sessionId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: UserProfile,
  ) {
    return this.workoutsService.addPhotos(sessionId, files, user);
  }
}
