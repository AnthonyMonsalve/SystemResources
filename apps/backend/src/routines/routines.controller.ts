import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserProfile } from '../users/entities/user.entity';
import { AddExerciseToRoutineDto } from './dto/add-exercise-to-routine.dto';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { QueryRoutinesDto } from './dto/query-routines.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutinesService } from './routines.service';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  create(@Body() createRoutineDto: CreateRoutineDto, @CurrentUser() user: UserProfile) {
    return this.routinesService.create(createRoutineDto, user);
  }

  @Get()
  findAll(@Query() queryDto: QueryRoutinesDto, @CurrentUser() user: UserProfile) {
    return this.routinesService.findAll(queryDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.routinesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoutineDto: UpdateRoutineDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.routinesService.update(id, updateRoutineDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.routinesService.remove(id, user);
  }

  @Post(':id/exercises')
  addExercise(
    @Param('id') id: string,
    @Body() addExerciseDto: AddExerciseToRoutineDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.routinesService.addExercise(id, addExerciseDto, user);
  }

  @Delete(':routineId/exercises/:exerciseId')
  removeExercise(
    @Param('routineId') routineId: string,
    @Param('exerciseId') exerciseId: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.routinesService.removeExercise(routineId, exerciseId, user);
  }

  @Patch(':routineId/exercises/:exerciseId')
  updateExerciseInRoutine(
    @Param('routineId') routineId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() updateDto: Partial<AddExerciseToRoutineDto>,
    @CurrentUser() user: UserProfile,
  ) {
    return this.routinesService.updateExerciseInRoutine(
      routineId,
      exerciseId,
      updateDto,
      user,
    );
  }
}
