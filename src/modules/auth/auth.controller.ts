import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from '#/modules/auth/dto/register.dto';
import { AuthService } from '#/modules/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return await this.authService.register(registerData);
  }
}
