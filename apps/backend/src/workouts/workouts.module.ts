import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSession } from './entities/workout-session.entity';
import { ExerciseSet } from './entities/exercise-set.entity';
import { WorkoutComment } from './entities/workout-comment.entity';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { RoutinesModule } from '../routines/routines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutSession, ExerciseSet, WorkoutComment]),
    RoutinesModule,
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
