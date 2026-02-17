import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { basename } from 'path';
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
    file: Express.Multer.File,
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

    const existingCover = await this.mediaRepository.findOne({
      where: { postId: post.id, isCover: true },
    });
    const shouldBeCover = dto.isCover === true || !existingCover;

    const fileName = basename(file.path);
    const media = this.mediaRepository.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      tags: dto.tags ?? [],
      url: `/uploads/${fileName}`,
      mimeType: file.mimetype,
      size: file.size,
      post,
      postId: post.id,
      isCover: shouldBeCover,
    });
    const saved = await this.mediaRepository.save(media);

    if (shouldBeCover) {
      await this.mediaRepository.update(
        { postId: post.id, id: Not(saved.id) },
        { isCover: false },
      );
    }

    return saved;
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
    if (media.isCover) {
      const replacement = await this.mediaRepository.findOne({
        where: { postId: media.postId, id: Not(media.id) },
        order: { createdAt: 'DESC' },
      });
      if (!replacement) {
        throw new BadRequestException(
          'Cover media is required for posts',
        );
      }
      await this.mediaRepository.remove(media);
      if (!replacement.isCover) {
        replacement.isCover = true;
        await this.mediaRepository.save(replacement);
      }
      return;
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
