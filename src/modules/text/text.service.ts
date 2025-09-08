import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTextDto } from '#/modules/text/dto/request/create-text.dto';
import { UpdateTextDto } from '#/modules/text/dto/request/update-text.dto';
import { DatabaseService } from '#/modules/database/database.service';
import { GetAllTextsDto } from '#/modules/text/dto/request/get-all-texts.dto';
import { GetTextsForGameDto } from '#/modules/text/dto/request/get-texts-for-game.dto';
import { GameModeType, Language } from '@prisma/client';

@Injectable()
export class TextService {

  constructor(private readonly databaseService: DatabaseService) {
  }

  async getAll(query: GetAllTextsDto) {
    const { page = 1, limit = 10, language } = query;
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const where = language ? { language } : {};

    const [texts, total] = await Promise.all([
      this.databaseService.text.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.databaseService.text.count({ where }),
    ]);

    return {
      message: 'Texts retrieved successfully.',
      texts,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
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

  async getOne(id: string) {
    const text = await this.databaseService.text.findUnique({
      where: { id },
    });

    if (!text) {
      throw new NotFoundException(`Text with ID "${id}" not found.`);
    }

    return {
      message: 'Text retrieved successfully.',
      text,
    };
  }

  async updateOne(id: string, updateTextDto: UpdateTextDto) {
    const existingText = await this.databaseService.text.findUnique({
      where: { id },
    });

    if (!existingText) {
      throw new NotFoundException(`Text with ID "${id}" not found.`);
    }

    const updatedText = await this.databaseService.text.update({
      where: { id },
      data: updateTextDto,
    });

    return {
      message: 'Text updated successfully.',
      updatedText,
    };
  }

  async deleteOne(id: string) {
    // Check if text exists first
    const existingText = await this.databaseService.text.findUnique({
      where: { id },
    });

    if (!existingText) {
      throw new NotFoundException(`Text with ID "${id}" not found.`);
    }

    await this.databaseService.text.delete({
      where: { id },
    });

    return {
      message: 'Text deleted successfully.',
      deletedText: existingText,
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

  async getTextsForGame(query: GetTextsForGameDto) {
    const { gameModeId, language } = query;

    // Validate that the provided gameModeId exists
    const gameMode = await this.databaseService.gameMode.findUnique({
      where: { id: gameModeId },
    });
    
    if (!gameMode) {
      throw new NotFoundException(`Game mode with ID "${gameModeId}" not found.`);
    }

    // Get random texts for the specified language
    const availableTexts = await this.databaseService.text.findMany({
      where: { language },
    });

    if (availableTexts.length === 0) {
      throw new NotFoundException(`No texts found for language ${language}.`);
    }

    // Pick a random text
    const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];

    let gameContent: string;
    let wordCount: number | null = null;

    if (gameMode.type === GameModeType.BY_WORD) {
      // For word-based games, return exactly the number of words specified
      const words = randomText.content.split(/\s+/).filter(word => word.length > 0);
      const targetWords = words.slice(0, gameMode.value);
      gameContent = targetWords.join(' ');
      wordCount = targetWords.length;
    } else {
      // For time-based games, return the full text
      gameContent = randomText.content;
      wordCount = randomText.content.split(/\s+/).filter(word => word.length > 0).length;
    }

    return {
      message: 'Game text retrieved successfully.',
      gameMode: {
        id: gameMode.id,
        type: gameMode.type,
        value: gameMode.value,
      },
      content: gameContent,
      wordCount,
      language,
    };
  }
}
