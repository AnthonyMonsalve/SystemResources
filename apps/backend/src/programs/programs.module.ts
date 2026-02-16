import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesModule } from '../routines/routines.module';
import { User } from '../users/entities/user.entity';
import { ProgramClient } from './entities/program-client.entity';
import { TrainingProgram } from './entities/training-program.entity';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingProgram, ProgramClient, User]),
    RoutinesModule,
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
