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
  create(@Body() createProgramDto: CreateProgramDto, @GetUser() user: User) {
    return this.programsService.create(createProgramDto, user);
  }

  @Get()
  findAll(@Query() queryDto: QueryProgramsDto, @GetUser() user: User) {
    return this.programsService.findAll(queryDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.programsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @GetUser() user: User,
  ) {
    return this.programsService.update(id, updateProgramDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.programsService.remove(id, user);
  }

  @Post(':id/clients')
  assignClient(
    @Param('id') id: string,
    @Body() assignClientDto: AssignClientDto,
    @GetUser() user: User,
  ) {
    return this.programsService.assignClient(id, assignClientDto, user);
  }

  @Delete(':programId/clients/:clientId')
  unassignClient(
    @Param('programId') programId: string,
    @Param('clientId') clientId: string,
    @GetUser() user: User,
  ) {
    return this.programsService.unassignClient(programId, clientId, user);
  }

  @Get(':id/clients')
  getClientsForProgram(@Param('id') id: string, @GetUser() user: User) {
    return this.programsService.getClientsForProgram(id, user);
  }

  @Get('clients/:clientId')
  getProgramsForClient(
    @Param('clientId') clientId: string,
    @GetUser() user: User,
  ) {
    return this.programsService.getProgramsForClient(clientId, user);
  }
}
