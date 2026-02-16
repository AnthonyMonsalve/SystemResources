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
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
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
  create(@Body() createRoutineDto: CreateRoutineDto, @GetUser() user: User) {
    return this.routinesService.create(createRoutineDto, user);
  }

  @Get()
  findAll(@Query() queryDto: QueryRoutinesDto, @GetUser() user: User) {
    return this.routinesService.findAll(queryDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.routinesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoutineDto: UpdateRoutineDto,
    @GetUser() user: User,
  ) {
    return this.routinesService.update(id, updateRoutineDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.routinesService.remove(id, user);
  }

  @Post(':id/exercises')
  addExercise(
    @Param('id') id: string,
    @Body() addExerciseDto: AddExerciseToRoutineDto,
    @GetUser() user: User,
  ) {
    return this.routinesService.addExercise(id, addExerciseDto, user);
  }

  @Delete(':routineId/exercises/:exerciseId')
  removeExercise(
    @Param('routineId') routineId: string,
    @Param('exerciseId') exerciseId: string,
    @GetUser() user: User,
  ) {
    return this.routinesService.removeExercise(routineId, exerciseId, user);
  }

  @Patch(':routineId/exercises/:exerciseId')
  updateExerciseInRoutine(
    @Param('routineId') routineId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() updateDto: Partial<AddExerciseToRoutineDto>,
    @GetUser() user: User,
  ) {
    return this.routinesService.updateExerciseInRoutine(
      routineId,
      exerciseId,
      updateDto,
      user,
    );
  }
}
