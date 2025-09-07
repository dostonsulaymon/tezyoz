import { Injectable } from '@nestjs/common';
import { DatabaseService } from '#/modules/database/database.service';

@Injectable()
export class GamemodeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllGameModes() {
    const gameModes = await this.databaseService.gameMode.findMany({
      orderBy: [
        { type: 'asc' },
        { value: 'asc' }
      ]
    });

    return {
      gameModes
    };
  }
}
