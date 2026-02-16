import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExercisesService } from '../exercises/exercises.service';
import { User, UserRole } from '../users/entities/user.entity';
import { AddExerciseToRoutineDto } from './dto/add-exercise-to-routine.dto';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { QueryRoutinesDto } from './dto/query-routines.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { Routine } from './entities/routine.entity';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine)
    private routinesRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private routineExercisesRepository: Repository<RoutineExercise>,
    private exercisesService: ExercisesService,
  ) {}

  async create(createRoutineDto: CreateRoutineDto, user: User): Promise<Routine> {
    // Only ADMIN and TRAINER can create routines
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TRAINER) {
      throw new ForbiddenException(
        'Only admins and trainers can create routines',
      );
    }

    const { exercises, ...routineData } = createRoutineDto;

    const routine = this.routinesRepository.create({
      ...routineData,
      createdById: user.id,
    });

    const savedRoutine = await this.routinesRepository.save(routine);

    // Add exercises if provided
    if (exercises && exercises.length > 0) {
      for (const exerciseDto of exercises) {
        await this.addExercise(savedRoutine.id, exerciseDto, user);
      }
    }

    return this.findOne(savedRoutine.id, user);
  }

  async findAll(
    queryDto: QueryRoutinesDto,
    user: User,
  ): Promise<{ data: Routine[]; total: number; page: number; limit: number }> {
    const { dayOfWeek, isPublic, createdById, page = 1, limit = 20 } = queryDto;

    const queryBuilder = this.routinesRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect('routine.createdBy', 'createdBy')
      .leftJoinAndSelect('routine.exercises', 'routineExercises')
      .leftJoinAndSelect('routineExercises.exercise', 'exercise')
      .orderBy('routine.createdAt', 'DESC')
      .addOrderBy('routineExercises.order', 'ASC');

    // Filter by visibility - only public routines or own routines
    queryBuilder.andWhere(
      '(routine.isPublic = :isPublic OR routine.createdById = :userId)',
      { isPublic: true, userId: user.id },
    );

    if (dayOfWeek) {
      queryBuilder.andWhere('routine.dayOfWeek = :dayOfWeek', { dayOfWeek });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('routine.isPublic = :isPublic', { isPublic });
    }

    if (createdById) {
      queryBuilder.andWhere('routine.createdById = :createdById', {
        createdById,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, user: User): Promise<Routine> {
    const routine = await this.routinesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'exercises', 'exercises.exercise'],
      order: {
        exercises: {
          order: 'ASC',
        },
      },
    });

    if (!routine) {
      throw new NotFoundException(`Routine with ID ${id} not found`);
    }

    // Check if user can view this routine
    if (!routine.isPublic && routine.createdById !== user.id) {
      throw new ForbiddenException('You cannot view this private routine');
    }

    return routine;
  }

  async update(
    id: string,
    updateRoutineDto: UpdateRoutineDto,
    user: User,
  ): Promise<Routine> {
    const routine = await this.findOne(id, user);

    // Only creator or ADMIN can update
    if (routine.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update routines you created');
    }

    const { exercises, ...routineData } = updateRoutineDto;

    Object.assign(routine, routineData);
    await this.routinesRepository.save(routine);

    return this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const routine = await this.findOne(id, user);

    // Only creator or ADMIN can delete
    if (routine.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete routines you created');
    }

    await this.routinesRepository.remove(routine);
  }

  async addExercise(
    routineId: string,
    addExerciseDto: AddExerciseToRoutineDto,
    user: User,
  ): Promise<RoutineExercise> {
    const routine = await this.findOne(routineId, user);

    // Only creator or ADMIN can modify
    if (routine.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only modify routines you created',
      );
    }

    // Verify exercise exists
    await this.exercisesService.findOne(addExerciseDto.exerciseId);

    const routineExercise = this.routineExercisesRepository.create({
      routineId,
      ...addExerciseDto,
    });

    return this.routineExercisesRepository.save(routineExercise);
  }

  async removeExercise(
    routineId: string,
    exerciseId: string,
    user: User,
  ): Promise<void> {
    const routine = await this.findOne(routineId, user);

    // Only creator or ADMIN can modify
    if (routine.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only modify routines you created',
      );
    }

    const routineExercise = await this.routineExercisesRepository.findOne({
      where: { routineId, exerciseId },
    });

    if (!routineExercise) {
      throw new NotFoundException(
        `Exercise ${exerciseId} not found in routine ${routineId}`,
      );
    }

    await this.routineExercisesRepository.remove(routineExercise);
  }

  async updateExerciseInRoutine(
    routineId: string,
    exerciseId: string,
    updateDto: Partial<AddExerciseToRoutineDto>,
    user: User,
  ): Promise<RoutineExercise> {
    const routine = await this.findOne(routineId, user);

    // Only creator or ADMIN can modify
    if (routine.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only modify routines you created',
      );
    }

    const routineExercise = await this.routineExercisesRepository.findOne({
      where: { routineId, exerciseId },
    });

    if (!routineExercise) {
      throw new NotFoundException(
        `Exercise ${exerciseId} not found in routine ${routineId}`,
      );
    }

    Object.assign(routineExercise, updateDto);
    return this.routineExercisesRepository.save(routineExercise);
  }
}
