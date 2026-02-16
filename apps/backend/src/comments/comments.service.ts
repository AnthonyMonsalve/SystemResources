import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { PostsService } from '../posts/posts.service';
import { UserProfile, UserRole } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { sanitizeCommentHtml } from './utils/sanitize-html';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postsService: PostsService,
  ) {}

  async create(
    dto: CreateCommentDto,
    currentUser: UserProfile,
  ): Promise<Comment> {
    // 1. Verificar que el post existe
    const post = await this.postsRepository.findOne({
      where: { id: dto.postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // 2. Verificar que el usuario puede ver el post (reutilizar lógica de PostsService)
    await this.postsService.ensureCanViewPost(post, currentUser);

    // 3. Sanitizar contenido HTML
    const sanitizedContent = sanitizeCommentHtml(dto.content);

    // 4. Crear comentario
    const comment = this.commentsRepository.create({
      content: sanitizedContent,
      postId: dto.postId,
      authorId: currentUser.id,
    });

    return this.commentsRepository.save(comment);
  }

  async findByPost(
    query: QueryCommentsDto,
    currentUser: UserProfile,
  ): Promise<{
    items: Comment[];
    total: number;
    page: number;
    limit: number;
  }> {
    // 1. Verificar acceso al post
    const post = await this.postsRepository.findOne({
      where: { id: query.postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.postsService.ensureCanViewPost(post, currentUser);

    // 2. Paginar comentarios
    const [items, total] = await this.commentsRepository.findAndCount({
      where: { postId: query.postId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return { items, total, page: query.page, limit: query.limit };
  }

  async update(
    id: string,
    dto: UpdateCommentDto,
    currentUser: UserProfile,
  ): Promise<Comment> {
    // 1. Buscar comentario
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 2. Verificar autorización (solo el autor puede editar)
    if (comment.authorId !== currentUser.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // 3. Actualizar con contenido sanitizado
    comment.content = sanitizeCommentHtml(dto.content);
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, currentUser: UserProfile): Promise<void> {
    // 1. Buscar comentario con relaciones
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['post'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // 2. Verificar autorización
    const canDelete =
      comment.authorId === currentUser.id || // Autor del comentario
      comment.post.createdById === currentUser.id || // Autor del post
      currentUser.role === UserRole.ADMIN; // Administrador

    if (!canDelete) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    // 3. Eliminar
    await this.commentsRepository.remove(comment);
  }
}
