import { Module } from '@nestjs/common';
import { GamemodeService } from './gamemode.service';
import { GamemodeController } from './gamemode.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GamemodeController],
  providers: [GamemodeService],
})
export class GamemodeModule {}
