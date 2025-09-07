import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { validateEnv } from './shared/configs/env.config';
import { AuthModule } from '#/modules/auth/auth.module';
import { MailModule } from '#/modules/mail/mail.module';
import { AppController } from '#/app.controller';
import { TextModule } from '#/modules/text/text.module';
import { UserModule } from '#/modules/user/user.module';
import { AttemptModule } from '#/modules/attempt/attempt.module';

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
    TextModule,
    UserModule,
    AttemptModule,
  ],

  controllers: [AppController],
})
export class AppModule {
}
