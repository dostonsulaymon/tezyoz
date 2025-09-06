import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '#/modules/database/database.service';
import logger from '#/shared/utils/logger';
import { JWTPayloadForUser } from '#/modules/auth/types';

@Injectable()
export class UserService {

  constructor(private readonly databaseService: DatabaseService) {
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
