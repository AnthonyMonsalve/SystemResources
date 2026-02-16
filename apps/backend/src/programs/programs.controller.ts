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
import { AssignClientDto } from './dto/assign-client.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { QueryProgramsDto } from './dto/query-programs.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramsService } from './programs.service';

@Controller('programs')
@UseGuards(JwtAuthGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  create(@Body() createProgramDto: CreateProgramDto, @CurrentUser() user: UserProfile) {
    return this.programsService.create(createProgramDto, user);
  }

  @Get()
  findAll(@Query() queryDto: QueryProgramsDto, @CurrentUser() user: UserProfile) {
    return this.programsService.findAll(queryDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.programsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.programsService.update(id, updateProgramDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.programsService.remove(id, user);
  }

  @Post(':id/clients')
  assignClient(
    @Param('id') id: string,
    @Body() assignClientDto: AssignClientDto,
    @CurrentUser() user: UserProfile,
  ) {
    return this.programsService.assignClient(id, assignClientDto, user);
  }

  @Delete(':programId/clients/:clientId')
  unassignClient(
    @Param('programId') programId: string,
    @Param('clientId') clientId: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.programsService.unassignClient(programId, clientId, user);
  }

  @Get(':id/clients')
  getClientsForProgram(@Param('id') id: string, @CurrentUser() user: UserProfile) {
    return this.programsService.getClientsForProgram(id, user);
  }

  @Get('clients/:clientId')
  getProgramsForClient(
    @Param('clientId') clientId: string,
    @CurrentUser() user: UserProfile,
  ) {
    return this.programsService.getProgramsForClient(clientId, user);
  }
}
