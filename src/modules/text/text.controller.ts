import { Body, Controller, Post } from '@nestjs/common';
import { TextService } from './text.service';
import { CreateTextDto } from '#/modules/text/dto/create-text.dto';
import { CreateBulkTextDto } from '#/modules/text/dto/create-bulk-texts.dto';

@Controller('text')
export class TextController {
  constructor(private readonly textService: TextService) {}

  @Post()
  async createOne(@Body() createTextDto: CreateTextDto) {
    return await this.textService.createOne(createTextDto);
  }

  @Post('bulk')
  async createBulk(@Body() createBulkTextDto: CreateBulkTextDto) {
    return await this.textService.createBulk(createBulkTextDto.texts);
  }

}
