import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import type { UserProfile } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RoutinesService } from '../routines/routines.service';
import { WorkoutSession, WorkoutStatus } from './entities/workout-session.entity';
import { ExerciseSet } from './entities/exercise-set.entity';
import { WorkoutComment } from './entities/workout-comment.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { LogSetDto } from './dto/log-set.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutSession)
    private sessionsRepository: Repository<WorkoutSession>,
    @InjectRepository(ExerciseSet)
    private setsRepository: Repository<ExerciseSet>,
    @InjectRepository(WorkoutComment)
    private commentsRepository: Repository<WorkoutComment>,
    private routinesService: RoutinesService,
    private usersService: UsersService,
  ) {}

  async createSession(
    createDto: CreateSessionDto,
    user: UserProfile,
  ): Promise<WorkoutSession> {
    // Verify routine exists and user has access
    await this.routinesService.findOne(createDto.routineId, user);

    // Check for existing active session
    const activeSession = await this.sessionsRepository.findOne({
      where: {
        userId: user.id,
        status: In([WorkoutStatus.IN_PROGRESS, WorkoutStatus.PAUSED]),
      },
    });

    if (activeSession) {
      throw new BadRequestException(
        'You already have an active workout session. Please complete or abandon it first.',
      );
    }

    // Create new session
    const session = this.sessionsRepository.create({
      userId: user.id,
      routineId: createDto.routineId,
      programId: createDto.programId,
      status: WorkoutStatus.IN_PROGRESS,
      startedAt: new Date(),
      currentExerciseIndex: 0,
      currentSetNumber: 1,
      totalDurationSeconds: 0,
    });

    const savedSession = await this.sessionsRepository.save(session);

    // Return with routine relation loaded
    return this.getSession(savedSession.id, user);
  }

  async getSession(id: string, user: UserProfile): Promise<WorkoutSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: [
        'routine',
        'routine.exercises',
        'routine.exercises.exercise',
        'sets',
        'sets.routineExercise',
        'comments',
      ],
    });

    if (!session) {
      throw new NotFoundException(`Workout session with ID ${id} not found`);
    }

    // Check if user owns this session
    if (session.userId !== user.id) {
      throw new ForbiddenException('You cannot access this workout session');
    }

    return session;
  }

  async updateSession(
    id: string,
    updateDto: UpdateSessionDto,
    user: UserProfile,
  ): Promise<WorkoutSession> {
    const session = await this.getSession(id, user);

    // Handle status transitions
    if (updateDto.status) {
      if (updateDto.status === WorkoutStatus.PAUSED && session.status === WorkoutStatus.IN_PROGRESS) {
        session.pausedAt = new Date();
      }

      if (updateDto.status === WorkoutStatus.IN_PROGRESS && session.status === WorkoutStatus.PAUSED) {
        // Resuming from pause - calculate elapsed time
        if (session.pausedAt) {
          const pauseDuration = Math.floor(
            (new Date().getTime() - session.pausedAt.getTime()) / 1000,
          );
          // Don't add pause time to total duration
          session.pausedAt = undefined;
        }
      }

      if (updateDto.status === WorkoutStatus.COMPLETED) {
        session.completedAt = new Date();
        // Calculate total duration
        if (!updateDto.totalDurationSeconds) {
          const duration = Math.floor(
            (new Date().getTime() - session.startedAt.getTime()) / 1000,
          );
          session.totalDurationSeconds = duration;
        }
      }
    }

    // Update fields
    Object.assign(session, updateDto);

    await this.sessionsRepository.save(session);

    return this.getSession(id, user);
  }

  async logSet(
    sessionId: string,
    logSetDto: LogSetDto,
    user: UserProfile,
  ): Promise<ExerciseSet> {
    const session = await this.getSession(sessionId, user);

    // Verify session is in progress
    if (session.status !== WorkoutStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Cannot log sets for a session that is not in progress',
      );
    }

    // Create exercise set record
    const exerciseSet = this.setsRepository.create({
      sessionId,
      routineExerciseId: logSetDto.routineExerciseId,
      setNumber: logSetDto.setNumber,
      repsCompleted: logSetDto.repsCompleted,
      durationSeconds: logSetDto.durationSeconds,
      weightKg: logSetDto.weightKg,
      completed: logSetDto.completed ?? true,
      skipped: logSetDto.skipped ?? false,
      completedAt: new Date(),
      notes: logSetDto.notes,
    });

    const savedSet = await this.setsRepository.save(exerciseSet);

    // Auto-advance logic
    await this.autoAdvance(session);

    return savedSet;
  }

  private async autoAdvance(session: WorkoutSession): Promise<void> {
    if (!session.routine || !session.routine.exercises) {
      return;
    }

    const currentExercise = session.routine.exercises[session.currentExerciseIndex];
    if (!currentExercise) return;

    // Get target sets for current exercise
    const targetSets = currentExercise.sets || currentExercise.exercise?.defaultSets || 3;

    // Get completed sets for current exercise
    const completedSets = await this.setsRepository.count({
      where: {
        sessionId: session.id,
        routineExerciseId: currentExercise.id,
        completed: true,
      },
    });

    // Check if current exercise is complete
    if (completedSets >= targetSets) {
      // Move to next exercise
      if (session.currentExerciseIndex < session.routine.exercises.length - 1) {
        session.currentExerciseIndex += 1;
        session.currentSetNumber = 1;
      } else {
        // All exercises complete - mark session as completed
        session.status = WorkoutStatus.COMPLETED;
        session.completedAt = new Date();
        const duration = Math.floor(
          (new Date().getTime() - session.startedAt.getTime()) / 1000,
        );
        session.totalDurationSeconds = duration;
      }
    } else {
      // Advance to next set
      session.currentSetNumber = completedSets + 1;
    }

    // Update only session fields without cascading to relations
    await this.sessionsRepository.update(session.id, {
      currentExerciseIndex: session.currentExerciseIndex,
      currentSetNumber: session.currentSetNumber,
      status: session.status,
      completedAt: session.completedAt,
      totalDurationSeconds: session.totalDurationSeconds,
    });
  }

  async addComment(
    sessionId: string,
    addCommentDto: AddCommentDto,
    user: UserProfile,
  ): Promise<WorkoutComment> {
    const session = await this.getSession(sessionId, user);

    const comment = this.commentsRepository.create({
      sessionId,
      routineExerciseId: addCommentDto.routineExerciseId,
      content: addCommentDto.content,
      type: addCommentDto.type,
    });

    return this.commentsRepository.save(comment);
  }

  async getActiveSession(user: UserProfile): Promise<WorkoutSession | null> {
    const session = await this.sessionsRepository.findOne({
      where: {
        userId: user.id,
        status: In([WorkoutStatus.IN_PROGRESS, WorkoutStatus.PAUSED]),
      },
      relations: [
        'routine',
        'routine.exercises',
        'routine.exercises.exercise',
        'sets',
        'comments',
      ],
      order: {
        startedAt: 'DESC',
      },
    });

    return session;
  }

  async getHistory(
    queryDto: QuerySessionsDto,
    user: UserProfile,
  ): Promise<{ data: WorkoutSession[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = queryDto;

    const queryBuilder = this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId: user.id })
      .leftJoinAndSelect('session.routine', 'routine')
      .leftJoinAndSelect('session.sets', 'sets')
      .orderBy('session.startedAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('session.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async addPhotos(
    sessionId: string,
    files: Express.Multer.File[],
    user: UserProfile,
  ): Promise<WorkoutSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    // Verify user owns this session
    if (session.userId !== user.id) {
      throw new ForbiddenException('You can only add photos to your own workout sessions');
    }

    // Generate photo URLs (relative paths)
    const photoUrls = files.map((file) => `/uploads/workout-photos/${file.filename}`);

    // Add new photos to existing ones (or initialize if null)
    session.photos = [...(session.photos || []), ...photoUrls];

    await this.sessionsRepository.save(session);

    return session;
  }

  async getClientHistory(
    clientId: string,
    queryDto: QuerySessionsDto,
    trainer: UserProfile,
  ): Promise<{ data: WorkoutSession[]; total: number; page: number; limit: number }> {
    // Verify that the client belongs to this trainer
    await this.usersService.findClientById(clientId, trainer.id);

    const { status, page = 1, limit = 20 } = queryDto;

    const queryBuilder = this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.userId = :userId', { userId: clientId })
      .leftJoinAndSelect('session.routine', 'routine')
      .leftJoinAndSelect('session.sets', 'sets')
      .orderBy('session.startedAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('session.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getAllClientsHistory(
    queryDto: QuerySessionsDto,
    trainer: UserProfile,
  ): Promise<{ data: WorkoutSession[]; total: number; page: number; limit: number }> {
    // Get all clients of this trainer
    const clients = await this.usersService.findClientsByTrainerId(trainer.id);
    const clientIds = clients.map((client) => client.id);

    if (clientIds.length === 0) {
      return { data: [], total: 0, page: 1, limit: queryDto.limit || 20 };
    }

    const { status, page = 1, limit = 20 } = queryDto;

    const queryBuilder = this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.userId IN (:...clientIds)', { clientIds })
      .leftJoinAndSelect('session.routine', 'routine')
      .leftJoinAndSelect('session.user', 'user')
      .leftJoinAndSelect('session.sets', 'sets')
      .orderBy('session.startedAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('session.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}
