import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyMeasurement } from './entities/body-measurement.entity';
import { User } from './entities/user.entity';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { ProfileController } from './profile.controller';
import { TrainerClientsController } from './trainer-clients.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, BodyMeasurement])],
  controllers: [ProfileController, TrainerClientsController, MeasurementsController],
  providers: [UsersService, MeasurementsService],
  exports: [UsersService, MeasurementsService, TypeOrmModule],
})
export class UsersModule {}
