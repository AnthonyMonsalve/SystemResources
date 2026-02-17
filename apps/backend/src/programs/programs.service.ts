import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutinesService } from '../routines/routines.service';
import { User } from '../users/entities/user.entity';
import type { UserProfile } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import { AssignClientDto } from './dto/assign-client.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { QueryProgramsDto } from './dto/query-programs.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramClient } from './entities/program-client.entity';
import { TrainingProgram } from './entities/training-program.entity';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(TrainingProgram)
    private programsRepository: Repository<TrainingProgram>,
    @InjectRepository(ProgramClient)
    private programClientsRepository: Repository<ProgramClient>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private routinesService: RoutinesService,
  ) {}

  async create(
    createProgramDto: CreateProgramDto,
    user: UserProfile,
  ): Promise<TrainingProgram> {
    // Only ADMIN and TRAINER can create programs
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.TRAINER) {
      throw new ForbiddenException(
        'Only admins and trainers can create programs',
      );
    }

    const { routineIds, ...programData } = createProgramDto;

    const program = this.programsRepository.create({
      ...programData,
      createdById: user.id,
    });

    const savedProgram = await this.programsRepository.save(program);

    // Assign routines if provided
    if (routineIds && routineIds.length > 0) {
      for (const routineId of routineIds) {
        // Verify routine exists and user has access
        const routine = await this.routinesService.findOne(routineId, user);
        routine.programId = savedProgram.id;
        await this.routinesService.update(routineId, { ...routine }, user);
      }
    }

    return this.findOne(savedProgram.id, user);
  }

  async findAll(
    queryDto: QueryProgramsDto,
    user: UserProfile,
  ): Promise<{
    data: TrainingProgram[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      targetLevel,
      targetGoal,
      isTemplate,
      createdById,
      clientId,
      page = 1,
      limit = 20,
    } = queryDto;

    const queryBuilder = this.programsRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.createdBy', 'createdBy')
      .leftJoinAndSelect('program.routines', 'routines')
      .leftJoinAndSelect('program.assignedClients', 'assignedClients')
      .leftJoinAndSelect('assignedClients.client', 'client')
      .orderBy('program.createdAt', 'DESC');

    // Users can only see programs they created or are assigned to
    queryBuilder.andWhere(
      '(program.createdById = :userId OR assignedClients.clientId = :userId)',
      { userId: user.id },
    );

    if (targetLevel) {
      queryBuilder.andWhere('program.targetLevel = :targetLevel', {
        targetLevel,
      });
    }

    if (targetGoal) {
      queryBuilder.andWhere('program.targetGoal = :targetGoal', {
        targetGoal,
      });
    }

    if (isTemplate !== undefined) {
      queryBuilder.andWhere('program.isTemplate = :isTemplate', {
        isTemplate,
      });
    }

    if (createdById) {
      queryBuilder.andWhere('program.createdById = :createdById', {
        createdById,
      });
    }

    if (clientId) {
      queryBuilder.andWhere('assignedClients.clientId = :clientId', {
        clientId,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string, user: UserProfile): Promise<TrainingProgram> {
    const program = await this.programsRepository.findOne({
      where: { id },
      relations: [
        'createdBy',
        'routines',
        'routines.exercises',
        'routines.exercises.exercise',
        'assignedClients',
        'assignedClients.client',
      ],
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    // Check if user can view this program (creator or assigned client)
    const isCreator = program.createdById === user.id;
    const isAssignedClient = program.assignedClients.some(
      (pc) => pc.clientId === user.id,
    );

    if (!isCreator && !isAssignedClient && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot view this program');
    }

    return program;
  }

  async update(
    id: string,
    updateProgramDto: UpdateProgramDto,
    user: UserProfile,
  ): Promise<TrainingProgram> {
    const program = await this.findOne(id, user);

    // Only creator or ADMIN can update
    if (program.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update programs you created');
    }

    const { routineIds, ...programData } = updateProgramDto;

    Object.assign(program, programData);
    await this.programsRepository.save(program);

    return this.findOne(id, user);
  }

  async remove(id: string, user: UserProfile): Promise<void> {
    const program = await this.findOne(id, user);

    // Only creator or ADMIN can delete
    if (program.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete programs you created');
    }

    await this.programsRepository.remove(program);
  }

  async assignClient(
    programId: string,
    assignClientDto: AssignClientDto,
    user: UserProfile,
  ): Promise<ProgramClient> {
    const program = await this.findOne(programId, user);

    // Only creator or ADMIN can assign clients
    if (program.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only assign clients to programs you created',
      );
    }

    // Verify client exists
    const client = await this.usersRepository.findOne({
      where: { id: assignClientDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${assignClientDto.clientId} not found`,
      );
    }

    // Check if client is already assigned
    const existingAssignment = await this.programClientsRepository.findOne({
      where: { programId, clientId: assignClientDto.clientId },
    });

    if (existingAssignment) {
      throw new ForbiddenException('Client is already assigned to this program');
    }

    const programClient = this.programClientsRepository.create({
      programId,
      clientId: assignClientDto.clientId,
      assignedAt: new Date(),
      startDate: assignClientDto.startDate,
      endDate: assignClientDto.endDate,
    });

    return this.programClientsRepository.save(programClient);
  }

  async unassignClient(
    programId: string,
    clientId: string,
    user: UserProfile,
  ): Promise<void> {
    const program = await this.findOne(programId, user);

    // Only creator or ADMIN can unassign clients
    if (program.createdById !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only unassign clients from programs you created',
      );
    }

    const programClient = await this.programClientsRepository.findOne({
      where: { programId, clientId },
    });

    if (!programClient) {
      throw new NotFoundException(
        `Client ${clientId} is not assigned to program ${programId}`,
      );
    }

    await this.programClientsRepository.remove(programClient);
  }

  async getClientsForProgram(
    programId: string,
    user: UserProfile,
  ): Promise<ProgramClient[]> {
    const program = await this.findOne(programId, user);

    return this.programClientsRepository.find({
      where: { programId },
      relations: ['client'],
    });
  }

  async getProgramsForClient(
    clientId: string,
    user: UserProfile,
  ): Promise<TrainingProgram[]> {
    // Only the client themselves, their trainer, or ADMIN can view
    if (
      clientId !== user.id &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.TRAINER
    ) {
      throw new ForbiddenException(
        'You can only view programs for yourself or your clients',
      );
    }

    const programClients = await this.programClientsRepository.find({
      where: { clientId },
      relations: [
        'program',
        'program.createdBy',
        'program.routines',
        'program.routines.exercises',
        'program.routines.exercises.exercise',
        'program.assignedClients',
      ],
    });

    return programClients.map((pc) => pc.program);
  }
}
