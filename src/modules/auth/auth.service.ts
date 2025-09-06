import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from '#/modules/auth/dto/register.dto';
import { DatabaseService } from '#/modules/database/database.service';
import { JwtService } from '@nestjs/jwt';
import logger from '#/shared/utils/logger';
import { MailService } from '#/modules/mail/mail.service';
import { LoginDto } from '#/modules/auth/dto/login.dto';
import { generateVerificationCode } from '#/shared/utils/generate-verification-code.util';
import { comparePassword, hashPassword } from '#/shared/utils/hashing.util';
import { JWTPayloadForUser, UserRole } from '#/modules/auth/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
  }

  async register(registerData: RegisterDto) {
    logger.info('Registration attempt', { email: registerData.email });

    const existingUser = await this.databaseService.user.findUnique({
      where: { email: registerData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hashPassword(registerData.password);

    const user = await this.databaseService.user.create({
      data: {
        email: registerData.email,
        password: hashedPassword,
        status: 'IN_REGISTRATION',
      },
    });

    const otp = generateVerificationCode();

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

  async verifyOtp(email: string, otp: string) {
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

    const newUser = await this.databaseService.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE' },
    });

    const accessToken = await this.getAccessToken({ userId: newUser.id, role: UserRole.User });
    const refreshToken = await this.getRefreshToken({ userId: newUser.id, role: UserRole.User });

    return {
      message: 'User verified successfully',
      data: { accessToken, refreshToken },
    };
  }

  async login(loginData: LoginDto) {
    logger.info('Login attempt', { email: loginData.email });

    const user = await this.databaseService.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials or user not active');
    }

    const isPasswordValid = await comparePassword(loginData.password, user.password!);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.getAccessToken({ userId: user.id, role: UserRole.User });
    const refreshToken = await this.getRefreshToken({ userId: user.id, role: UserRole.User });


    return {
      message: 'Login successful',
      data: { accessToken, refreshToken },
    };
  }

  async getAccessToken(user: JWTPayloadForUser, expiresIn?: string) {
    const payload = { userId: user.userId, role: user.role };

    if (expiresIn) {
      return await this.jwtService.signAsync(payload, { expiresIn });
    }

    return await this.jwtService.signAsync(payload);
  }

  async getRefreshToken(user: JWTPayloadForUser, expiresIn?: string) {
    const payload = { userId: user.userId, role: user.role };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: expiresIn || this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });
  }
}
