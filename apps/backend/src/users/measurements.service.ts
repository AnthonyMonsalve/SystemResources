import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { BodyMeasurement, BodyMeasurementDto } from './entities/body-measurement.entity';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(BodyMeasurement)
    private readonly measurementsRepository: Repository<BodyMeasurement>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createMeasurement(
    userId: string,
    dto: CreateMeasurementDto,
  ): Promise<BodyMeasurementDto> {
    const measurement = this.measurementsRepository.create({
      userId,
      weight: dto.weight,
      height: dto.height,
      bodyFatPercentage: dto.bodyFatPercentage,
      muscleMass: dto.muscleMass,
      chest: dto.chest,
      waist: dto.waist,
      hips: dto.hips,
      arms: dto.arms,
      thighs: dto.thighs,
      notes: dto.notes,
      measurementDate: dto.measurementDate ? new Date(dto.measurementDate) : new Date(),
    });

    const saved = await this.measurementsRepository.save(measurement);
    return this.toDto(saved);
  }

  async getUserMeasurements(
    userId: string,
    limit: number = 50,
  ): Promise<BodyMeasurementDto[]> {
    const measurements = await this.measurementsRepository.find({
      where: { userId },
      order: { measurementDate: 'DESC' },
      take: limit,
    });

    return measurements.map((m) => this.toDto(m));
  }

  async getClientMeasurements(
    clientId: string,
    trainerId: string,
  ): Promise<BodyMeasurementDto[]> {
    // Verify trainer has access to this client
    const client = await this.usersRepository.findOne({
      where: { id: clientId, trainerId, role: UserRole.CLIENT },
    });

    if (!client) {
      throw new ForbiddenException('Access denied to this client');
    }

    return this.getUserMeasurements(clientId);
  }

  async getLatestMeasurement(userId: string): Promise<BodyMeasurementDto | null> {
    const measurement = await this.measurementsRepository.findOne({
      where: { userId },
      order: { measurementDate: 'DESC' },
    });

    return measurement ? this.toDto(measurement) : null;
  }

  async deleteMeasurement(measurementId: string, userId: string): Promise<void> {
    const measurement = await this.measurementsRepository.findOne({
      where: { id: measurementId, userId },
    });

    if (!measurement) {
      throw new NotFoundException('Measurement not found');
    }

    await this.measurementsRepository.remove(measurement);
  }

  private toDto(measurement: BodyMeasurement): BodyMeasurementDto {
    return {
      id: measurement.id,
      userId: measurement.userId,
      weight: Number(measurement.weight),
      height: measurement.height ? Number(measurement.height) : undefined,
      bodyFatPercentage: measurement.bodyFatPercentage
        ? Number(measurement.bodyFatPercentage)
        : undefined,
      muscleMass: measurement.muscleMass ? Number(measurement.muscleMass) : undefined,
      chest: measurement.chest ? Number(measurement.chest) : undefined,
      waist: measurement.waist ? Number(measurement.waist) : undefined,
      hips: measurement.hips ? Number(measurement.hips) : undefined,
      arms: measurement.arms ? Number(measurement.arms) : undefined,
      thighs: measurement.thighs ? Number(measurement.thighs) : undefined,
      notes: measurement.notes,
      measurementDate: measurement.measurementDate,
      createdAt: measurement.createdAt,
    };
  }
}
