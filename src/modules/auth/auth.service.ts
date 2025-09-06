import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from '#/modules/auth/dto/register.dto';
import { DatabaseService } from '#/modules/database/database.service';
import logger from '#/shared/utils/logger';
import { MailService } from '#/modules/mail/mail.service';
import { LoginDto } from '#/modules/auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) {}

  async register(registerData: RegisterDto) {
    logger.info('Registration attempt', { email: registerData.email });

    const existingUser = await this.databaseService.user.findUnique({
      where: { email: registerData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.databaseService.user.create({
      data: {
        email: registerData.email,
        password: registerData.password, // hash this in real life!
        status: 'IN_REGISTRATION',
      },
    });

    const otp = await generateOtp();

    await this.databaseService.mail.create({
      data: {
        email: registerData.email,
        otp,
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.mailService.sendOtp(registerData.email, otp);

    return { message: 'OTP sent to email' };
  }

  async confirmOtp(email: string, otp: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
      include: { mails: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const latestMail = user.mails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!latestMail || latestMail.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (latestMail.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    await this.databaseService.mail.update({
      where: { id: latestMail.id },
      data: { status: 'VERIFIED', usedAt: new Date() },
    });

    await this.databaseService.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE' },
    });

    return { message: 'User verified successfully' };
  }

  async login(loginData: LoginDto) {
    logger.info('Login attempt', { email: loginData.email });

    const user = await this.databaseService.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials or user not active');
    }

    const isPasswordValid = await this.validatePassword(loginData.password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = 'mocked_jwt_token_here';

    return {
      message: 'Login successful',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private async validatePassword(password: string, hash: string): Promise<boolean> {
    return password === hash;
  }
}

async function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
