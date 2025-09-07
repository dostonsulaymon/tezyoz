import { Body, Controller, Delete, Get, Put, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '#/modules/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from '#/modules/auth/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { JWTPayloadForUser, UserRole } from '#/modules/auth/types';
import { Request } from 'express';
import { DeleteUserDto } from '#/modules/user/dto/request/delete-user.dto';
import {
  DeleteUserSuccessResponse,
  GetAllUsersSuccessResponse,
  GetUserSuccessResponse,
  UpdateUserSuccessResponse,
  ChangePasswordSuccessResponse,
  UserValidationErrorResponse,
  UserNotFoundErrorResponse,
  UserForbiddenErrorResponse,
  UserUnauthorizedErrorResponse,
  UserInternalServerErrorResponse,
} from '#/modules/user/dto/response/user-response.dto';
import logger from '#/shared/utils/logger';
import { UpdateUserDto } from '#/modules/user/dto/request/update-user.dto';
import { ChangePasswordDto } from '#/modules/user/dto/request/change-password.dto';

@ApiTags('User Management')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: GetAllUsersSuccessResponse,
  })
  async getUsers() {
    return await this.userService.getAllUsers();
  }

  @Get('/profile')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: GetUserSuccessResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: UserUnauthorizedErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
    type: UserNotFoundErrorResponse,
  })
  async getProfile(@Req() req: Request) {
    const user = req.user as JWTPayloadForUser;
    return await this.userService.getUserProfile(user);
  }

  @Put('/profile')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile information' })
  @ApiBody({
    description: 'Profile update data',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    type: UpdateUserSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: UserValidationErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
    type: UserUnauthorizedErrorResponse,
  })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = req.user as JWTPayloadForUser;
    return await this.userService.updateUserProfile(user, dto);
  }

  @Put('/profile/password')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({
    description: 'Password change data',
    type: ChangePasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully changed',
    type: ChangePasswordSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or password mismatch',
    type: UserValidationErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
    type: UserUnauthorizedErrorResponse,
  })
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const user = req.user as JWTPayloadForUser;
    return await this.userService.changePassword(user, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: GetUserSuccessResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: UserNotFoundErrorResponse,
  })
  async getUser(@Param('id') id: string) {
    return await this.userService.getUserById(id);
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
    type: DeleteUserSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or cannot delete own account',
    type: UserValidationErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
    type: UserUnauthorizedErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
    type: UserForbiddenErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: UserNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: UserInternalServerErrorResponse,
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
    type: DeleteUserSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or cannot delete own account',
    type: UserValidationErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
    type: UserUnauthorizedErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
    type: UserForbiddenErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: UserNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: UserInternalServerErrorResponse,
  })
  async deleteUserById(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as JWTPayloadForUser;
    return await this.userService.deleteUserById(id, user);
  }
}