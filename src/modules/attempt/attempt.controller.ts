import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttemptService } from './attempt.service';
import { OptionalAuthGuard } from '#/modules/auth/guards/optional-auth.guard';
import { CreateAttemptDto } from './dto/request/create-attempt.dto';
import { GetAttemptsDto } from './dto/request/get-attempts.dto';
import { GetStatsDto } from './dto/request/get-stats.dto';
import { GetLeaderboardDto } from './dto/request/get-leaderboard.dto';
import { StartSessionDto } from './dto/request/start-session.dto';
import {
  CreateAttemptSuccessResponse,
  GetAttemptsSuccessResponse,
  GetAttemptSuccessResponse,
  GetStatsSuccessResponse,
  GetLeaderboardSuccessResponse,
  StartSessionSuccessResponse,
  AttemptValidationErrorResponse,
  AttemptNotFoundErrorResponse,
  AttemptUnauthorizedErrorResponse,
  AttemptInternalServerErrorResponse,
} from './dto/response/attempt-response.dto';
import { AuthRequest } from '#/modules/auth/types';
import { Language, GameModeType } from '@prisma/client';
import { InternalServerErrorResponse } from '#/modules/text/dto/response/text-response.dto';

@ApiTags('Attempt Management')
@Controller('attempt')
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: 'Submit typing attempt',
    description: 'Submit a completed typing attempt with results. Works for both authenticated users and guests. For guests, username is required.',
  })
  @ApiBody({
    type: CreateAttemptDto,
    description: 'Attempt submission data',
    examples: {
      authenticatedUser: {
        summary: 'Authenticated user attempt',
        value: {
          language: Language.ENGLISH,
          gameModeId: '507f1f77bcf86cd799439012',
          wpm: 65.5,
          accuracy: 96.8,
          errors: 2,
        },
      },
      guestUser: {
        summary: 'Guest user attempt',
        value: {
          language: Language.ENGLISH,
          gameModeId: '507f1f77bcf86cd799439012',
          wpm: 45.2,
          accuracy: 94.1,
          errors: 5,
          username: 'guest_typing_master',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Attempt submitted successfully',
    type: CreateAttemptSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: AttemptValidationErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Game mode not found',
    type: AttemptNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: AttemptInternalServerErrorResponse,
  })
  async create(@Body() createAttemptDto: CreateAttemptDto, @Request() req: AuthRequest) {
    return await this.attemptService.create(createAttemptDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user attempts',
    description: 'Retrieve typing attempt history for the authenticated user with pagination and filtering options.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page (max: 100)',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'language',
    description: 'Filter by language',
    required: false,
    enum: Language,
    example: Language.ENGLISH,
  })
  @ApiQuery({
    name: 'gameModeType',
    description: 'Filter by game mode type',
    required: false,
    enum: GameModeType,
    example: GameModeType.BY_TIME,
  })
  @ApiQuery({
    name: 'gameModeValue',
    description: 'Filter by game mode value',
    required: false,
    type: Number,
    example: 30,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort by field',
    required: false,
    enum: ['createdAt', 'wpm', 'accuracy'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'dateFrom',
    description: 'Filter from date (ISO string)',
    required: false,
    type: String,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'dateTo',
    description: 'Filter to date (ISO string)',
    required: false,
    type: String,
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Attempts retrieved successfully',
    type: GetAttemptsSuccessResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
    type: AttemptUnauthorizedErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: AttemptInternalServerErrorResponse,
  })
  async findAll(@Query() query: GetAttemptsDto, @Request() req: AuthRequest) {
    return await this.attemptService.findAll(query, req.user);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieve comprehensive typing statistics for the authenticated user including personal bests, progress, and language breakdown.',
  })
  @ApiQuery({
    name: 'period',
    description: 'Time period for statistics',
    required: false,
    enum: ['7d', '30d', '90d', '1y', 'all'],
    example: 'all',
  })
  @ApiQuery({
    name: 'language',
    description: 'Filter statistics by language',
    required: false,
    enum: Language,
    example: Language.ENGLISH,
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: GetStatsSuccessResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
    type: AttemptUnauthorizedErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: AttemptInternalServerErrorResponse,
  })
  async getStats(@Query() query: GetStatsDto, @Request() req: AuthRequest) {
    return await this.attemptService.getStats(query, req.user);
  }

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Get leaderboards',
    description: 'Retrieve typing leaderboards with various filtering options. Shows only users with usernames.',
  })
  @ApiQuery({
    name: 'type',
    description: 'Leaderboard type',
    required: false,
    enum: ['global', 'gameMode', 'language'],
    example: 'global',
  })
  @ApiQuery({
    name: 'gameModeId',
    description: 'Game mode ID (required if type is gameMode)',
    required: false,
    type: String,
    example: '68bc1c01d22b4badd4387a4f',
  })
  @ApiQuery({
    name: 'language',
    description: 'Language filter (required if type is language)',
    required: false,
    enum: Language,
    example: Language.ENGLISH,
  })
  @ApiQuery({
    name: 'period',
    description: 'Time period for leaderboard',
    required: false,
    enum: ['daily', 'weekly', 'monthly', 'all'],
    example: 'all',
  })
  @ApiQuery({
    name: 'metric',
    description: 'Metric to rank by',
    required: false,
    enum: ['wpm', 'accuracy'],
    example: 'wpm',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page (max: 100)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    type: GetLeaderboardSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
    type: AttemptValidationErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponse,
  })
  async getLeaderboard(@Query() query: GetLeaderboardDto) {
    return await this.attemptService.getLeaderboard(query);
  }

  @Post('start-session')
  @ApiOperation({
    summary: 'Start typing session',
    description: 'Initialize a typing session and get text to type. Works for both authenticated and guest users.',
  })
  @ApiBody({
    type: StartSessionDto,
    description: 'Session start data',
    examples: {
      timeMode: {
        summary: 'Time-based typing session',
        value: {
          language: Language.ENGLISH,
          gameModeId: '507f1f77bcf86cd799439012',
        },
      },
      wordMode: {
        summary: 'Word-based typing session',
        value: {
          language: Language.RUSSIAN,
          gameModeId: '507f1f77bcf86cd799439013',
        },
      },
      specificText: {
        summary: 'Specific text session',
        value: {
          language: Language.UZBEK,
          gameModeId: '507f1f77bcf86cd799439012',
          textId: '507f1f77bcf86cd799439014',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Typing session started successfully',
    type: StartSessionSuccessResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: AttemptValidationErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Game mode or text not found',
    type: AttemptNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponse,
  })
  async startSession(@Body() startSessionDto: StartSessionDto) {
    return await this.attemptService.startSession(startSessionDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single attempt',
    description: 'Retrieve detailed information about a specific typing attempt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Attempt unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Attempt retrieved successfully',
    type: GetAttemptSuccessResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Attempt not found',
    type: AttemptNotFoundErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    return await this.attemptService.findOne(id);
  }
}
