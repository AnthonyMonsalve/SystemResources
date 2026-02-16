import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesModule } from '../exercises/exercises.module';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { Routine } from './entities/routine.entity';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Routine, RoutineExercise]),
    ExercisesModule,
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
