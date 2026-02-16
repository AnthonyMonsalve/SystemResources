import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from '../exercises/entities/exercise.entity';
import { ProgramClient } from '../programs/entities/program-client.entity';
import { TrainingProgram } from '../programs/entities/training-program.entity';
import { RoutineExercise } from '../routines/entities/routine-exercise.entity';
import { Routine } from '../routines/entities/routine.entity';
import { User } from '../users/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Exercise,
      Routine,
      RoutineExercise,
      TrainingProgram,
      ProgramClient,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
