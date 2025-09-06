import { Module } from '@nestjs/common';
import { TextService } from './text.service';
import { TextController } from './text.controller';
import { DatabaseModule } from '#/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TextController],
  providers: [TextService],
})
export class TextModule {
}
