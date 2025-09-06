import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTextDto } from '#/modules/text/dto/request/create-text.dto';
import { UpdateTextDto } from '#/modules/text/dto/request/update-text.dto';
import { DatabaseService } from '#/modules/database/database.service';
import { GetAllTextsDto } from '#/modules/text/dto/request/get-all-texts.dto';

@Injectable()
export class TextService {

  constructor(private readonly databaseService: DatabaseService) {
  }

  async getAll(query: GetAllTextsDto) {
    const { page = 1, limit = 10, language } = query;
    const skip = (page - 1) * Math.min(limit, 100); // Max 100 items per page
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
}