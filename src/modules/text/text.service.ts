import { Injectable } from '@nestjs/common';
import { CreateTextDto } from '#/modules/text/dto/request/create-text.dto';

@Injectable()
export class TextService {
  async createOne(createTextDto: CreateTextDto) {
    return Promise.resolve(undefined);
  }

  async createBulk(texts: CreateTextDto[]) {
    return Promise.resolve(undefined);
  }
}
