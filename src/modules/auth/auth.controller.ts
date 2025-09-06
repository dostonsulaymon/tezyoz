import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from '#/modules/auth/dto/register.dto';
import { LoginDto } from '#/modules/auth/dto/login.dto';
import { 
  RegisterSuccessResponse, 
  LoginSuccessResponse, 
  ValidationErrorResponse, 
  ConflictErrorResponse, 
  UnauthorizedErrorResponse 
} from '#/modules/auth/dto/auth-response.dto';
import { AuthService } from '#/modules/auth/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: RegisterSuccessResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data',
    type: ValidationErrorResponse
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - User already exists',
    type: ConflictErrorResponse
  })
  async register(@Body() registerData: RegisterDto) {
    return await this.authService.register(registerData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in',
    type: LoginSuccessResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data',
    type: ValidationErrorResponse
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid credentials',
    type: UnauthorizedErrorResponse
  })
  async login(@Body() loginData: LoginDto) {
    return await this.authService.login(loginData);
  }
}
