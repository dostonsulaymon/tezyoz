import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '#/modules/auth/dto/register.dto';
import { DatabaseService } from '#/modules/database/database.service';
import logger from '#/shared/utils/logger';

@Injectable()
export class AuthService {

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}


  async register(registerData: RegisterDto) {

    const databaseUrl = this.configService.getOrThrow<string>('DATABASE_URL');

    logger.info(`Hello world register service`);
    
    return Promise.resolve(undefined);
  }
}
