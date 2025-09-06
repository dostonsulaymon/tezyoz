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
        message: { type: 'string', example: 'OTP verified successfully' },
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
  async login(@Body() loginData: LoginDto) {
    return await this.authService.login(loginData);
  }
}
