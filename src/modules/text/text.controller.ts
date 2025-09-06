import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { TextService } from './text.service';

import { Language } from '@prisma/client';
import { CreateTextDto } from '#/modules/text/dto/request/create-text.dto';
import {
  CreateBulkTextSuccessResponse,
  CreateTextSuccessResponse,
  InternalServerErrorResponse,
  TextValidationErrorResponse,
} from '#/modules/text/dto/response/text-response.dto';
import { CreateBulkTextDto } from '#/modules/text/dto/request/create-bulk-texts.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '#/modules/auth/guards/roles.guard';
import { Roles } from '#/modules/auth/decorators/roles.decorator';
import { UserRole } from '#/modules/auth/types';

@ApiTags('Text Management')
@Controller('text')
export class TextController {
  constructor(private readonly textService: TextService) {
  }

  @Post()
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a single text',
    description: 'Creates a new text entry with the specified language and content. The content is limited to 1500 characters.',
  })
  @ApiBody({
    type: CreateTextDto,
    description: 'Text creation data',
    examples: {
      uzbekText: {
        summary: 'Uzbek text example',
        value: {
          language: Language.UZBEK,
          content: 'Bu test uchun o\'zbek tilidagi matn namunasi.',
        },
      },
      englishText: {
        summary: 'English text example',
        value: {
          language: Language.ENGLISH,
          content: 'This is a sample English text for testing purposes.',
        },
      },
      russianText: {
        summary: 'Russian text example',
        value: {
          language: Language.RUSSIAN,
          content: 'Это пример русского текста для тестирования.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Text successfully created',
    type: CreateTextSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or validation errors',
    type: TextValidationErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Database or server issues',
    type: InternalServerErrorResponse,
  })
  async createOne(@Body() createTextDto: CreateTextDto) {
    return await this.textService.createOne(createTextDto);
  }

  @Post('bulk')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create multiple texts in bulk',
    description: 'Creates multiple text entries at once. Each text must have a valid language and content. Useful for batch operations and initial data seeding.',
  })
  @ApiBody({
    type: CreateBulkTextDto,
    description: 'Bulk text creation data',
    examples: {
      multiLanguageTexts: {
        summary: 'Multiple texts in different languages',
        value: {
          texts: [
            {
              language: Language.UZBEK,
              content: 'Bu birinchi o\'zbek tilidagi matn.',
            },
            {
              language: Language.ENGLISH,
              content: 'This is the first English text sample.',
            },
            {
              language: Language.RUSSIAN,
              content: 'Это первый пример русского текста.',
            },
            {
              language: Language.UZBEK,
              content: 'Bu ikkinchi o\'zbek tilidagi matn namunasi.',
            },
          ],
        },
      },
      sameLanguageTexts: {
        summary: 'Multiple texts in the same language',
        value: {
          texts: [
            {
              language: Language.ENGLISH,
              content: 'The quick brown fox jumps over the lazy dog.',
            },
            {
              language: Language.ENGLISH,
              content: 'A journey of a thousand miles begins with a single step.',
            },
            {
              language: Language.ENGLISH,
              content: 'To be or not to be, that is the question.',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Texts successfully created in bulk',
    type: CreateBulkTextSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data, validation errors, or empty array',
    type: TextValidationErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Database or server issues during bulk operation',
    type: InternalServerErrorResponse,
  })
  async createBulk(@Body() createBulkTextDto: CreateBulkTextDto) {
    return await this.textService.createBulk(createBulkTextDto.texts);
  }
}