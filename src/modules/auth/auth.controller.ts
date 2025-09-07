import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from '#/modules/auth/dto/register.dto';
import { LoginDto } from '#/modules/auth/dto/login.dto';
import {
  RegisterSuccessResponse,
  LoginSuccessResponse,
  ValidationErrorResponse,
  ConflictErrorResponse,
  UnauthorizedErrorResponse,
} from '#/modules/auth/dto/auth-response.dto';
import { AuthService } from '#/modules/auth/auth.service';
import { VerifyDto } from '#/modules/auth/dto/verify.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: RegisterSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed - Invalid input data',
    type: ValidationErrorResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with this email already exists or registration already in progress',
    type: ConflictErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'InternalServerErrorException' },
      },
    },
  })
  async register(@Body() registerData: RegisterDto) {
    return await this.authService.register(registerData);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiBody({
    type: VerifyDto,
    description: 'Email and OTP code for verification',
    examples: {
      example1: {
        summary: 'Verify OTP example',
        value: {
          email: 'user@example.com',
          code: '12345',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP successfully verified',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User verified successfully' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid OTP, expired OTP, or user not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Invalid OTP',
          enum: ['User not found', 'Invalid OTP', 'OTP expired']
        },
        error: { type: 'string', example: 'BadRequestException' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'InternalServerErrorException' },
      },
    },
  })
  async verifyOtp(@Body() verifyDto: VerifyDto) {
    return await this.authService.verifyOtp(verifyDto.email, verifyDto.code);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed - Invalid input data',
    type: ValidationErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials or user not active',
    type: UnauthorizedErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Internal server error' },
        error: { type: 'string', example: 'InternalServerErrorException' },
      },
    },
  })
  async login(@Body() loginData: LoginDto) {
    return await this.authService.login(loginData);
  }
}