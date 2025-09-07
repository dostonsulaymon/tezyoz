import { Module } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { AttemptController } from './attempt.controller';
import { DatabaseModule } from '#/modules/database/database.module';
import { OptionalAuthGuard } from '#/modules/auth/guards/optional-auth.guard';
import { AccessTokenStrategy } from '#/modules/auth/strategies/access-token.strategy';

@Module({
  imports: [DatabaseModule],
  controllers: [AttemptController],
  providers: [AttemptService, OptionalAuthGuard, AccessTokenStrategy],
  exports: [AttemptService],
})
export class AttemptModule {}
