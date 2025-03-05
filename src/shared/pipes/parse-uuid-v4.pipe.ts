import { ParseUUIDPipe } from '@nestjs/common';

export class ParseUUIDV4Pipe extends ParseUUIDPipe {
  constructor() {
    super({ version: '4' });
  }
}
