import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '#/modules/database/database.service';
import logger from '#/shared/utils/logger';
import { JWTPayloadForUser } from '#/modules/auth/types';
import { UpdateUserDto } from '#/modules/user/dto/request/update-user.dto';
import { comparePassword, hashPassword } from '#/shared/utils/hashing.util';
import { ChangePasswordDto } from '#/modules/user/dto/request/change-password.dto';

@Injectable()
export class UserService {

  constructor(private readonly databaseService: DatabaseService) {
  }

  async getAllUsers() {
    try {
      const users = await this.databaseService.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;

  }

  async getUserProfile(user: JWTPayloadForUser) {
    const profile = await this.databaseService.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;

  }

  async updateUserProfile(user: JWTPayloadForUser, dto: UpdateUserDto) {
    const updatedUser = await this.databaseService.user.update({
      where: { id: user.userId },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async changePassword(user: JWTPayloadForUser, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    const currentUser = await this.databaseService.user.findUnique({
      where: { id: user.userId },
      select: { id: true, password: true },
    });

    if (!currentUser || !currentUser.password) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await comparePassword(
      dto.currentPassword,
      currentUser.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSamePassword = await comparePassword(
      dto.newPassword,
      currentUser.password,
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await hashPassword(dto.newPassword);

    // Update password
    await this.databaseService.user.update({
      where: { id: user.userId },
      data: { password: hashedNewPassword },
    });

    logger.info('Password changed successfully', { userId: user.userId });

    return {
      message: 'Password changed successfully',
    };

  }

  async deleteUserByEmail(email: string, currentUser: JWTPayloadForUser) {
    if (currentUser.email === email) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.databaseService.mail.deleteMany({
      where: { userId: user.id },
    });

    await this.databaseService.attempt.deleteMany({
      where: { userId: user.id },
    });

    // Delete the user
    await this.databaseService.user.delete({
      where: { email },
    });

    logger.info('User deleted by email', { email, deletedBy: currentUser.email });

    return {
      message: 'User deleted successfully',
    };
  }

  async deleteUserById(id: string, currentUser: JWTPayloadForUser) {
    if (currentUser.userId === id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete associated records first
    await this.databaseService.mail.deleteMany({
      where: { userId: id },
    });

    await this.databaseService.attempt.deleteMany({
      where: { userId: id },
    });

    // Delete the user
    await this.databaseService.user.delete({
      where: { id },
    });

    logger.info('User deleted by ID', { userId: id, deletedBy: currentUser.userId });

    return {
      message: 'User deleted successfully',
    };
  }

}
