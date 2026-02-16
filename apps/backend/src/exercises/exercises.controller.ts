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
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { QueryExercisesDto } from './dto/query-exercises.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  create(
    @Body() createExerciseDto: CreateExerciseDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.exercisesService.create(createExerciseDto, user);
  }

  @Get()
  findAll(@Query() queryDto: QueryExercisesDto) {
    return this.exercisesService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.exercisesService.update(id, updateExerciseDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.exercisesService.remove(id, user);
  }
}
