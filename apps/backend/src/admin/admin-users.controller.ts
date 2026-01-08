import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import type { UserProfile } from '../users/entities/user.entity';
import { AdminUsersService } from './admin-users.service';
import { AdminUserDto } from './dto/admin-user.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  list(): Promise<AdminUserDto[]> {
    return this.adminUsersService.list();
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<void> {
    return this.adminUsersService.remove(id, user.id);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserPasswordDto,
  ): Promise<AdminUserDto> {
    return this.adminUsersService.updatePassword(id, dto.password);
  }

  @Patch(':id/block')
  blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BlockUserDto,
    @CurrentUser() user: UserProfile,
  ): Promise<AdminUserDto> {
    return this.adminUsersService.blockUser(id, dto, user.id);
  }
}
