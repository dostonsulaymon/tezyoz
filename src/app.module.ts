import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { validateEnv } from './shared/configs/env.config';
import { AuthModule } from '#/modules/auth/auth.module';
import { MailModule } from '#/modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    MailModule,
  ],
})
export class AppModule {}
