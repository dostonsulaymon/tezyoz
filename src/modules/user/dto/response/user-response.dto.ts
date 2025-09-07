import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse, ErrorResponse } from '#/shared/dto/base-response.dto';
import { UserRole, UserStatus } from '@prisma/client';

export class UserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: 'string',
    format: 'email'
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: 'string',
    required: false
  })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: 'string',
    required: false
  })
  lastName?: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    type: 'string',
    required: false
  })
  username?: string;

  @ApiProperty({
    description: 'User status',
    example: UserStatus.ACTIVE,
    enum: UserStatus
  })
  status: UserStatus;

  @ApiProperty({
    description: 'User role',
    example: UserRole.USER,
    enum: UserRole
  })
  role: UserRole;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-16T14:20:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  updatedAt: string;
}

export class DeleteUserResponseData {
  @ApiProperty({
    description: 'Deletion success confirmation',
    example: 'User deleted successfully',
    type: 'string'
  })
  message: string;
}

export class GetAllUsersResponseData {
  @ApiProperty({
    description: 'List of users',
    type: [UserDto]
  })
  users: UserDto[];
}

export class GetUserResponseData {
  @ApiProperty({
    description: 'User information',
    type: UserDto
  })
  user: UserDto;
}

export class UpdateUserResponseData {
  @ApiProperty({
    description: 'Updated user information',
    type: UserDto
  })
  user: UserDto;
}

export class ChangePasswordResponseData {
  @ApiProperty({
    description: 'Password change confirmation',
    example: 'Password changed successfully',
    type: 'string'
  })
  message: string;
}

// Success Responses
export class GetAllUsersSuccessResponse extends SuccessResponse<GetAllUsersResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Users retrieved successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: GetAllUsersResponseData,
    description: 'Users list data'
  })
  data: GetAllUsersResponseData;
}

export class GetUserSuccessResponse extends SuccessResponse<GetUserResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'User retrieved successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: GetUserResponseData,
    description: 'User data'
  })
  data: GetUserResponseData;
}

export class UpdateUserSuccessResponse extends SuccessResponse<UpdateUserResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'User updated successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: UpdateUserResponseData,
    description: 'Updated user data'
  })
  data: UpdateUserResponseData;
}

export class ChangePasswordSuccessResponse extends SuccessResponse<ChangePasswordResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Password changed successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: ChangePasswordResponseData,
    description: 'Password change response data'
  })
  data: ChangePasswordResponseData;
}

export class DeleteUserSuccessResponse extends SuccessResponse<DeleteUserResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'User deleted successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: DeleteUserResponseData,
    description: 'Delete user response data'
  })
  data: DeleteUserResponseData;
}

// Error Responses
export class UserValidationErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 400,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'BadRequestException',
    description: 'Error type'
  })
  error: string;

  @ApiProperty({
    example: [
      'Email must be a valid email address',
      'Email is required'
    ],
    description: 'Validation error details',
    type: [String]
  })
  details: string[];
}

export class UserNotFoundErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 404,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'User not found',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'NotFoundException',
    description: 'Error type'
  })
  error: string;
}

export class UserForbiddenErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 403,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Cannot delete your own account',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'BadRequestException',
    description: 'Error type'
  })
  error: string;
}

export class UserUnauthorizedErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 401,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Unauthorized access',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'UnauthorizedException',
    description: 'Error type'
  })
  error: string;
}

export class UserInternalServerErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 500,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Internal server error occurred',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'InternalServerErrorException',
    description: 'Error type'
  })
  error: string;
}
