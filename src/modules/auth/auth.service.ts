import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '#/modules/auth/dto/register.dto';
import { DatabaseService } from '#/modules/database/database.service';
import logger from '#/shared/utils/logger';
import { MailService } from '#/modules/mail/mail.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}


  async register(registerData: RegisterDto) {

    await this.mailService.sendOtp(registerData.email, '0Y34B1' )
    
    return Promise.resolve(undefined);
  }
}
