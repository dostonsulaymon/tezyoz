import { Body, Controller, Post, Get, Put, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TextService } from './text.service';

import { Language } from '@prisma/client';
import { CreateTextDto } from '#/modules/text/dto/request/create-text.dto';
import { UpdateTextDto } from '#/modules/text/dto/request/update-text.dto';
import {
  CreateBulkTextSuccessResponse,
  CreateTextSuccessResponse,
  GetTextSuccessResponse,
  UpdateTextSuccessResponse,
  DeleteTextSuccessResponse,
  InternalServerErrorResponse,
  TextValidationErrorResponse,
  TextNotFoundErrorResponse, GetAllTextsSuccessResponse,
} from '#/modules/text/dto/response/text-response.dto';
import { CreateBulkTextDto } from '#/modules/text/dto/request/create-bulk-texts.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '#/modules/auth/guards/roles.guard';
import { Roles } from '#/modules/auth/decorators/roles.decorator';
import { UserRole } from '#/modules/auth/types';
import { GetAllTextsDto } from '#/modules/text/dto/request/get-all-texts.dto';

@ApiTags('Text Management')
@Controller('text')
export class TextController {
  constructor(private readonly textService: TextService) {
  }


  @Get()
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all texts',
    description: 'Retrieves all text entries from the database. Returns a list of texts with pagination support and optional filtering by language.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination (default: 1)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page (default: 10, max: 100)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'language',
    description: 'Filter texts by language',
    required: false,
    enum: Language,
    example: Language.ENGLISH,
  })
  @ApiResponse({
    status: 200,
    description: 'Texts successfully retrieved',
    type: GetAllTextsSuccessResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Database or server issues',
    type: InternalServerErrorResponse,
  })
  async getAll(@Query() query: GetAllTextsDto) {
    return await this.textService.getAll(query);
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
          content: 'Ð­Ñ‚Ð¾ Ð¿Ñ€Ð¸Ð¼ÐµÑ€ Ñ€ÑƒÑÑÐºÐ¾Ð³Ð¾ Ñ‚ÐµÐºÑÑ‚Ð° Ð´Ð»Ñ Ñ‚ÐµÑÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ñ.',
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

  @Get(':id')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get a text by ID',
    description: 'Retrieves a single text entry by its unique identifier. Returns the text with all its properties including language, content, and creation timestamp.',
  })
  @ApiParam({
    name: 'id',
    description: 'Text unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Text successfully retrieved',
    type: GetTextSuccessResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Text not found - No text exists with the provided ID',
    type: TextNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Database or server issues',
    type: InternalServerErrorResponse,
  })
  async getOne(@Param('id') id: string) {
    return await this.textService.getOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a text by ID',
    description: 'Updates an existing text entry. You can modify the language, content, or both. The content is limited to 1500 characters.',
  })
  @ApiParam({
    name: 'id',
    description: 'Text unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiBody({
    type: UpdateTextDto,
    description: 'Text update data',
    examples: {
      updateContent: {
        summary: 'Update text content only',
        value: {
          content: 'This is an updated text content with new information.',
        },
      },
      updateLanguage: {
        summary: 'Update text language only',
        value: {
          language: Language.RUSSIAN,
        },
      },
      updateBoth: {
        summary: 'Update both language and content',
        value: {
          language: Language.UZBEK,
          content: 'Bu yangilangan o\'zbek tilidagi matn.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Text successfully updated',
    type: UpdateTextSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or validation errors',
    type: TextValidationErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Text not found - No text exists with the provided ID',
    type: TextNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Database or server issues',
    type: InternalServerErrorResponse,
  })
  async updateOne(@Param('id') id: string, @Body() updateTextDto: UpdateTextDto) {
    return await this.textService.updateOne(id, updateTextDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a text by ID',
    description: 'Permanently deletes a text entry from the database. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Text unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Text successfully deleted',
    type: DeleteTextSuccessResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Text not found - No text exists with the provided ID',
    type: TextNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Database or server issues',
    type: InternalServerErrorResponse,
  })
  async deleteOne(@Param('id') id: string) {
    return await this.textService.deleteOne(id);
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
              content: 'Ð­Ñ‚Ð¾ Ð¿ÐµÑ€Ð²Ñ‹Ð¹ Ð¿Ñ€Ð¸Ð¼ÐµÑ€ Ñ€ÑƒÑÑÐºÐ¾Ð³Ð¾ Ñ‚ÐµÐºÑÑ‚Ð°.',
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