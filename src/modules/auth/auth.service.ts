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
import { UserStatus } from '@prisma/client';

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

    await this.cleanupExpiredRegistrations();

    const existingUser = await this.databaseService.user.findUnique({
      where: { email: registerData.email },
      include: { mails: true },
    });

    if (existingUser) {
      if (existingUser.status === 'ACTIVE') {
        throw new ConflictException('User with this email already exists');
      }

      if (existingUser.status === 'IN_REGISTRATION') {
        const latestMail = existingUser.mails.sort((a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime())[0];

        if (latestMail && latestMail.expiresAt > new Date() && latestMail.status === 'PENDING') {
          throw new ConflictException('Registration already in progress. Please check your email for the OTP or wait for it to expire.');
        }

        await this.databaseService.mail.deleteMany({
          where: { userId: existingUser.id }
        });

        await this.databaseService.user.delete({
          where: { id: existingUser.id }
        });
      }
    }

    const hashedPassword = await hashPassword(registerData.password);

    const user = await this.databaseService.user.create({
      data: {
        email: registerData.email,
        password: hashedPassword,
        status: 'IN_REGISTRATION',
        role: 'USER',
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

    await this.cleanupExpiredRegistrations();


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

    const userRole = this.mapPrismaRoleToEnumRole(newUser.role);
    const accessToken = await this.getAccessToken({ userId: newUser.id, role: userRole });
    const refreshToken = await this.getRefreshToken({ userId: newUser.id, role: userRole });

    return {
      message: 'User verified successfully',
      accessToken,
      refreshToken,
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

    // FIX: Use the actual user role from database instead of hardcoding
    const userRole = this.mapPrismaRoleToEnumRole(user.role);
    const accessToken = await this.getAccessToken({ userId: user.id, role: userRole });
    const refreshToken = await this.getRefreshToken({ userId: user.id, role: userRole });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }

  private mapPrismaRoleToEnumRole(prismaRole: string): UserRole {
    switch (prismaRole) {
      case 'ADMIN':
        return UserRole.Admin;
      case 'USER':
        return UserRole.User;
      default:
        return UserRole.User;
    }
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

  private async cleanupExpiredRegistrations() {
    try {
      const now = new Date();

      const expiredUsers = await this.databaseService.user.findMany({
        where: {
          status: 'IN_REGISTRATION',
        },
        include: {
          mails: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      const usersToDelete = expiredUsers.filter(user => {
        if (user.mails.length === 0) {
          // No OTP sent, delete user (shouldn't happen in normal flow)
          return true;
        }

        const latestMail = user.mails[0];


        return latestMail!.expiresAt < now && latestMail!.status === 'PENDING';
      });

      if (usersToDelete.length > 0) {
        const userIds = usersToDelete.map(user => user.id);

        // Delete associated mail records first
        await this.databaseService.mail.deleteMany({
          where: {
            userId: {
              in: userIds,
            },
          },
        });

        // Delete users
        const deletedCount = await this.databaseService.user.deleteMany({
          where: {
            id: {
              in: userIds,
            },
          },
        });

        logger.info(`Cleaned up ${deletedCount.count} expired registrations`);
      }
    } catch (error) {
      logger.error('Error cleaning up expired registrations', error);
      // Don't throw error to avoid breaking the main flow
    }
  }
}

