import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '#/modules/database/database.module';
import { MailModule } from '#/modules/mail/mail.module';

@Module({
  imports: [DatabaseModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {
}
