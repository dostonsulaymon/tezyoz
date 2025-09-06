import { Injectable } from '@nestjs/common';
import { CreateTextDto } from '#/modules/text/dto/request/create-text.dto';
import { DatabaseService } from '#/modules/database/database.service';

@Injectable()
export class TextService {

  constructor(private readonly databaseService: DatabaseService) {
  }

  async createOne(createTextDto: CreateTextDto) {
    const newText = await this.databaseService.text.create({
      data: createTextDto,
    });

    return {
      message: 'New text created successfully.',
      newText,
    };
  }

  async createBulk(texts: CreateTextDto[]) {
    const result = await this.databaseService.text.createMany({
      data: texts,
    });

    return {
      message: 'Bulk texts created successfully.',
      count: result.count,
    };
  }
}
