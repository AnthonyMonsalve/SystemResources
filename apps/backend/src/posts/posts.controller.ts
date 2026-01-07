import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post as HttpPost,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserProfile } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePostDto, @CurrentUser() user: UserProfile) {
    return this.postsService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }

  @Get('categories')
  getCategories(@CurrentUser() user: UserProfile) {
    return this.postsService.getAvailableCategories(user);
  }

  @Get(':id/media')
  findMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.postsService.findMediaForPost(id, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.postsService.findOne(id, user);
  }

  @Get()
  findAll(@Query() query: QueryPostsDto, @CurrentUser() user: UserProfile) {
    return this.postsService.findAll(query, user);
  }
}
