import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import type { BodyMeasurementDto } from './entities/body-measurement.entity';
import type { UserProfile } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import { MeasurementsService } from './measurements.service';

@ApiTags('Measurements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  @Roles(UserRole.CLIENT)
  async createMeasurement(
    @Body() dto: CreateMeasurementDto,
    @CurrentUser() user: UserProfile,
  ): Promise<BodyMeasurementDto> {
    return this.measurementsService.createMeasurement(user.id, dto);
  }

  @Get('my-measurements')
  @Roles(UserRole.CLIENT)
  async getMyMeasurements(
    @CurrentUser() user: UserProfile,
    @Query('limit') limit?: number,
  ): Promise<BodyMeasurementDto[]> {
    return this.measurementsService.getUserMeasurements(user.id, limit);
  }

  @Get('latest')
  @Roles(UserRole.CLIENT)
  async getMyLatestMeasurement(
    @CurrentUser() user: UserProfile,
  ): Promise<BodyMeasurementDto | null> {
    return this.measurementsService.getLatestMeasurement(user.id);
  }

  @Get('client/:clientId')
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  async getClientMeasurements(
    @Param('clientId') clientId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<BodyMeasurementDto[]> {
    return this.measurementsService.getClientMeasurements(clientId, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.CLIENT)
  async deleteMeasurement(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<{ message: string }> {
    await this.measurementsService.deleteMeasurement(id, user.id);
    return { message: 'Measurement deleted successfully' };
  }
}
