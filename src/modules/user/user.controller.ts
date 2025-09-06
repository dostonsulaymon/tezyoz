import { Body, Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '#/modules/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UnauthorizedErrorResponse, UserDto, ValidationErrorResponse } from '#/modules/auth/dto/auth-response.dto';
import { RolesGuard } from '#/modules/auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { JWTPayloadForUser, UserRole } from '#/modules/auth/types';
import { Request } from 'express';
import { DeleteUserDto } from '#/modules/user/dto/request/delete-user.dto';
import logger from '#/shared/utils/logger';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Delete('email')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user by email (Admin only)' })
  @ApiBody({
    description: 'Email of the user to delete',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User deleted successfully' },
      },
    },
  })
  async deleteUserByEmail(
    @Body() dto: DeleteUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as JWTPayloadForUser;
    logger.info(`I am being called with email ${user.email}`);
    return await this.userService.deleteUserByEmail(dto.email, user);
  }

  @Delete('id/:id')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID of the user to delete',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User deleted successfully' },
      },
    },
  })
  async deleteUserById(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as JWTPayloadForUser;
    return await this.userService.deleteUserById(id, user);
  }
}