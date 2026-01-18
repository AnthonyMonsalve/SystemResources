import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { GroupMember } from '../groups/entities/group-member.entity';
import { Group } from '../groups/entities/group.entity';
import { MediaFile } from '../media/entities/media-file.entity';
import { User, UserRole } from '../users/entities/user.entity';
import type { UserProfile } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostVisibility } from './entities/post.entity';
import { sanitizePostHtml } from './utils/sanitize-html';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMembersRepository: Repository<GroupMember>,
    @InjectRepository(MediaFile)
    private readonly mediaRepository: Repository<MediaFile>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreatePostDto, currentUser: UserProfile): Promise<Post> {
    const visibility = dto.visibility ?? PostVisibility.PUBLIC;
    const { ownerUserId, groupId } = await this.validateVisibilityTargets(
      visibility,
      dto.ownerUserId,
      dto.groupId,
    );

    const post = this.postsRepository.create({
      title: dto.title,
      description: sanitizePostHtml(dto.description),
      type: dto.type,
      category: dto.category,
      tags: dto.tags ?? [],
      visibility,
      ownerUserId,
      groupId,
      createdById: currentUser.id,
    });
    return this.postsRepository.save(post);
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const visibility = dto.visibility ?? post.visibility;
    const ownerUserId = dto.ownerUserId ?? post.ownerUserId;
    const groupId = dto.groupId ?? post.groupId;

    const validatedTargets = await this.validateVisibilityTargets(
      visibility,
      ownerUserId,
      groupId,
    );

    if (dto.title !== undefined) {
      post.title = dto.title;
    }
    if (dto.description !== undefined) {
      post.description = sanitizePostHtml(dto.description);
    }
    if (dto.type !== undefined) {
      post.type = dto.type;
    }
    if (dto.category !== undefined) {
      post.category = dto.category;
    }
    if (dto.tags !== undefined) {
      post.tags = dto.tags;
    }
    post.visibility = visibility;
    post.ownerUserId = validatedTargets.ownerUserId;
    post.groupId = validatedTargets.groupId;
    return this.postsRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Post not found');
    }
  }

  async findOne(id: string, currentUser: UserProfile): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['mediaFiles', 'group', 'ownerUser'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.ensureCanViewPost(post, currentUser);
    return post;
  }

  async findAll(
    query: QueryPostsDto,
    currentUser: UserProfile,
  ): Promise<{
    items: Post[];
    total: number;
    page: number;
    limit: number;
  }> {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.mediaFiles', 'media')
      .leftJoinAndSelect('post.group', 'group')
      .leftJoinAndSelect('post.ownerUser', 'owner')
      .orderBy('post.createdAt', 'DESC');

    if (query.visibility) {
      qb.andWhere('post.visibility = :visibility', {
        visibility: query.visibility,
      });
    }
    if (query.category) {
      qb.andWhere('post.category = :category', { category: query.category });
    }
    if (query.type) {
      qb.andWhere('post.type = :type', { type: query.type });
    }
    if (query.tags?.length) {
      qb.andWhere('post.tags && :tags', { tags: query.tags });
    }

    if (currentUser.role !== UserRole.ADMIN) {
      qb.andWhere(
        new Brackets((sq) => {
          sq.where('post.visibility = :public', {
            public: PostVisibility.PUBLIC,
          }).orWhere(
            new Brackets((inner) =>
              inner
                .where('post.visibility = :userVis', {
                  userVis: PostVisibility.USER,
                })
                .andWhere('post.ownerUserId = :userId'),
            ),
          );

          if (!query.category) {
            sq.orWhere(
              new Brackets((inner) =>
                inner
                  .where('post.visibility = :groupVis', {
                    groupVis: PostVisibility.GROUP,
                  })
                  .andWhere(
                    'EXISTS (SELECT 1 FROM group_members gm WHERE gm."groupId" = "post"."groupId" AND gm."userId" = :userId)',
                  ),
              ),
            );
          }
        }),
      ).setParameter('userId', currentUser.id);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async getAvailableCategories(
    currentUser: UserProfile,
  ): Promise<string[]> {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .select('DISTINCT post.category', 'category')
      .where('post.category IS NOT NULL')
      .andWhere("post.category <> ''")
      .orderBy('post.category', 'ASC');

    if (currentUser.role !== UserRole.ADMIN) {
      qb.andWhere(
        new Brackets((sq) => {
          sq.where('post.visibility = :public', {
            public: PostVisibility.PUBLIC,
          }).orWhere(
            new Brackets((inner) =>
              inner
                .where('post.visibility = :userVis', {
                  userVis: PostVisibility.USER,
                })
                .andWhere('post.ownerUserId = :userId'),
            ),
          );
        }),
      ).setParameter('userId', currentUser.id);
    }

    const rows = await qb.getRawMany<{ category: string }>();
    return rows
      .map((row) => row.category)
      .filter((value): value is string => !!value);
  }

  async findMediaForPost(
    postId: string,
    currentUser: UserProfile,
  ): Promise<MediaFile[]> {
    const post = await this.findAccessiblePostById(postId, currentUser);
    return this.mediaRepository.find({
      where: { postId: post.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findAccessiblePostById(
    postId: string,
    currentUser: UserProfile,
  ): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['group'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.ensureCanViewPost(post, currentUser);
    return post;
  }

  async ensureCanViewPost(
    post: Post,
    currentUser: UserProfile,
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }
    switch (post.visibility) {
      case PostVisibility.PUBLIC:
        return;
      case PostVisibility.USER:
        if (post.ownerUserId !== currentUser.id) {
          throw new ForbiddenException('Post is not visible to this user');
        }
        return;
      case PostVisibility.GROUP:
        if (!post.groupId) {
          throw new ForbiddenException('Post has no group assigned');
        }
        const membership = await this.groupMembersRepository.findOne({
          where: { groupId: post.groupId, userId: currentUser.id },
        });
        if (!membership) {
          throw new ForbiddenException('Post is not visible to this user');
        }
        return;
      default:
        throw new ForbiddenException('Unknown visibility rule');
    }
  }

  private async validateVisibilityTargets(
    visibility: PostVisibility,
    ownerUserId?: string,
    groupId?: string,
  ): Promise<{ ownerUserId?: string; groupId?: string }> {
    if (visibility === PostVisibility.USER) {
      if (!ownerUserId) {
        throw new BadRequestException('ownerUserId is required for USER posts');
      }
      const user = await this.usersRepository.findOne({
        where: { id: ownerUserId },
      });
      if (!user) {
        throw new NotFoundException('Owner user not found');
      }
      return { ownerUserId, groupId: undefined };
    }

    if (visibility === PostVisibility.GROUP) {
      if (!groupId) {
        throw new BadRequestException('groupId is required for GROUP posts');
      }
      const group = await this.groupsRepository.findOne({
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException('Group not found');
      }
      return { ownerUserId: undefined, groupId };
    }

    return { ownerUserId: undefined, groupId: undefined };
  }
}
