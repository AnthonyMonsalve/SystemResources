import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserProfile } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = join(process.cwd(), 'uploads');
    mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  upload(
    @UploadedFile() file: Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.mediaService.uploadFile(file, dto, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.mediaService.findOne(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.remove(id);
  }
}
