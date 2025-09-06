import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '#/modules/database/database.module';
import { MailModule } from '#/modules/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '#/modules/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '#/modules/auth/strategies/refresh-token.strategry';
import { RolesGuard } from '#/modules/auth/guards/roles.guard';


@Module({
  imports: [DatabaseModule, MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy, RolesGuard],

})
export class AuthModule {
}
