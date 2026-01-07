import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Multer } from 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserProfile } from '../users/entities/user.entity';
import { PostsService } from '../posts/posts.service';
import { MediaFile } from './entities/media-file.entity';
import { UploadMediaDto } from './dto/upload-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly mediaRepository: Repository<MediaFile>,
    private readonly postsService: PostsService,
  ) {}

  async uploadFile(
    file: Multer.File,
    dto: UploadMediaDto,
    currentUser: UserProfile,
  ): Promise<MediaFile> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const post = await this.postsService.findAccessiblePostById(
      dto.postId,
      currentUser,
    );

    const media = this.mediaRepository.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      tags: dto.tags ?? [],
      url: file.path.replace(/\\/g, '/'),
      mimeType: file.mimetype,
      size: file.size,
      post,
      postId: post.id,
    });
    return this.mediaRepository.save(media);
  }

  async findOne(id: string, currentUser: UserProfile): Promise<MediaFile> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['post'],
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    await this.postsService.ensureCanViewPost(media.post, currentUser);
    return media;
  }

  async remove(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    await this.mediaRepository.remove(media);
  }

  async findByPost(
    postId: string,
    currentUser: UserProfile,
  ): Promise<MediaFile[]> {
    return this.postsService.findMediaForPost(postId, currentUser);
  }
}
