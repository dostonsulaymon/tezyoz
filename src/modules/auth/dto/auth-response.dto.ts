import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse, ErrorResponse } from '#/shared/dto/base-response.dto';

export class UserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: 'string'
  })
  email: string;
}

export class RegisterResponseData {
  @ApiProperty({
    description: 'Registered user information',
    type: UserDto
  })
  user: UserDto;
}

export class LoginResponseData {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string'
  })
  access_token: string;

  @ApiProperty({
    description: 'Logged in user information',
    type: UserDto
  })
  user: UserDto;
}

export class RegisterSuccessResponse extends SuccessResponse<RegisterResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 201,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'User registered successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: RegisterResponseData,
    description: 'Registration response data'
  })
  data: RegisterResponseData;
}

export class LoginSuccessResponse extends SuccessResponse<LoginResponseData> {
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
    example: 'Login successful',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: LoginResponseData,
    description: 'Login response data'
  })
  data: LoginResponseData;
}

export class ValidationErrorResponse extends ErrorResponse {
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
    example: ['email must be a valid email', 'password must be longer than 6 characters'],
    description: 'Validation error details',
    type: [String]
  })
  details: string[];
}

export class ConflictErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 409,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'User with this email already exists',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'ConflictException',
    description: 'Error type'
  })
  error: string;
}

export class UnauthorizedErrorResponse extends ErrorResponse {
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
    example: 'Invalid credentials',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'UnauthorizedException',
    description: 'Error type'
  })
  error: string;
}
