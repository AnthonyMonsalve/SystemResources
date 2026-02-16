import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserProfile } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { QueryExercisesDto } from './dto/query-exercises.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exercisesRepository: Repository<Exercise>,
  ) {}

  async create(
    createExerciseDto: CreateExerciseDto,
    user: UserProfile,
  ): Promise<Exercise> {
    // Only ADMIN and TRAINER can create exercises
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TRAINER) {
      throw new ForbiddenException(
        'Only admins and trainers can create exercises',
      );
    }

    const exercise = this.exercisesRepository.create({
      ...createExerciseDto,
      createdById: user.id,
    });

    return this.exercisesRepository.save(exercise);
  }

  async findAll(
    queryDto: QueryExercisesDto,
  ): Promise<{ data: Exercise[]; total: number; page: number; limit: number }> {
    const { muscleGroup, equipment, difficulty, page = 1, limit = 20 } = queryDto;

    const queryBuilder = this.exercisesRepository
      .createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.createdBy', 'createdBy')
      .orderBy('exercise.createdAt', 'DESC');

    if (muscleGroup) {
      queryBuilder.andWhere('exercise.muscleGroup = :muscleGroup', {
        muscleGroup,
      });
    }

    if (equipment) {
      queryBuilder.andWhere('exercise.equipment = :equipment', { equipment });
    }

    if (difficulty) {
      queryBuilder.andWhere('exercise.difficulty = :difficulty', {
        difficulty,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Exercise> {
    const exercise = await this.exercisesRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return exercise;
  }

  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
    user: UserProfile,
  ): Promise<Exercise> {
    const exercise = await this.findOne(id);

    // Only creator or ADMIN can update
    if (exercise.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only update exercises you created',
      );
    }

    Object.assign(exercise, updateExerciseDto);
    return this.exercisesRepository.save(exercise);
  }

  async remove(id: string, user: UserProfile): Promise<void> {
    const exercise = await this.findOne(id);

    // Only creator or ADMIN can delete
    if (exercise.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only delete exercises you created',
      );
    }

    await this.exercisesRepository.remove(exercise);
  }
}
