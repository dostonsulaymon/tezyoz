import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse, ErrorResponse } from '#/shared/dto/base-response.dto';
import { Language, GameModeType } from '@prisma/client';

// Base DTOs
export class GameModeDto {
  @ApiProperty({
    description: 'Game mode unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'Game mode type',
    example: GameModeType.BY_TIME,
    enum: GameModeType
  })
  type: GameModeType;

  @ApiProperty({
    description: 'Game mode value (seconds for BY_TIME, words for BY_WORD)',
    example: 30,
    type: 'number'
  })
  value: number;
}

export class TextDto {
  @ApiProperty({
    description: 'Text unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'Text content',
    example: 'This is a sample typing text.',
    type: 'string'
  })
  content: string;

  @ApiProperty({
    description: 'Text language',
    example: Language.ENGLISH,
    enum: Language
  })
  language: Language;
}

export class UserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    type: 'string'
  })
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'typing_master',
    required: false,
    type: 'string'
  })
  username?: string;
}

export class AttemptDto {
  @ApiProperty({
    description: 'Attempt unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'User ID (null for guests)',
    example: '507f1f77bcf86cd799439011',
    required: false,
    type: 'string'
  })
  userId?: string;

  @ApiProperty({
    description: 'Username (for guests or authenticated users)',
    example: 'guest_user_123',
    required: false,
    type: 'string'
  })
  username?: string;

  @ApiProperty({
    description: 'User information (only for authenticated users)',
    type: UserDto,
    required: false
  })
  user?: UserDto;

  @ApiProperty({
    description: 'Language of the attempt',
    example: Language.ENGLISH,
    enum: Language
  })
  language: Language;

  @ApiProperty({
    description: 'Game mode information',
    type: GameModeDto
  })
  gameMode: GameModeDto;

  @ApiProperty({
    description: 'Text information (if available)',
    type: TextDto,
    required: false
  })
  text?: TextDto;

  @ApiProperty({
    description: 'Words per minute achieved',
    example: 45.5,
    type: 'number'
  })
  wpm: number;

  @ApiProperty({
    description: 'Accuracy percentage',
    example: 94.5,
    type: 'number'
  })
  accuracy: number;

  @ApiProperty({
    description: 'Number of errors made',
    example: 3,
    required: false,
    type: 'number'
  })
  errors?: number;

  @ApiProperty({
    description: 'Attempt creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  createdAt: string;

  @ApiProperty({
    description: 'Personal best indicators',
    type: 'object',
    required: false
  })
  isPersonalBest?: {
    wpm: boolean;
    accuracy: boolean;
  };
}

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    type: 'number'
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    type: 'number'
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 150,
    type: 'number'
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
    type: 'number'
  })
  totalPages: number;
}

export class LeaderboardPositionDto {
  @ApiProperty({
    description: 'Global leaderboard position',
    example: 15,
    type: 'number'
  })
  global: number;

  @ApiProperty({
    description: 'Game mode specific leaderboard position',
    example: 8,
    type: 'number'
  })
  gameMode: number;

  @ApiProperty({
    description: 'Language specific leaderboard position',
    example: 12,
    type: 'number'
  })
  language: number;
}

// Response Data Classes
export class CreateAttemptResponseData {
  @ApiProperty({
    description: 'Created attempt information',
    type: AttemptDto
  })
  attempt: AttemptDto;

  @ApiProperty({
    description: 'Leaderboard positions',
    type: LeaderboardPositionDto,
    required: false
  })
  leaderboardPosition?: LeaderboardPositionDto;
}

export class GetAttemptsResponseData {
  @ApiProperty({
    description: 'List of attempts',
    type: [AttemptDto]
  })
  attempts: AttemptDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto
  })
  pagination: PaginationDto;
}

export class GetAttemptResponseData {
  @ApiProperty({
    description: 'Attempt information',
    type: AttemptDto
  })
  attempt: AttemptDto;
}

// Personal Best Statistics
export class PersonalBestDto {
  @ApiProperty({
    description: 'WPM value',
    example: 75.5,
    type: 'number'
  })
  wpm: number;

  @ApiProperty({
    description: 'Accuracy percentage',
    example: 96.8,
    type: 'number'
  })
  accuracy: number;

  @ApiProperty({
    description: 'Date achieved',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  date: string;
}

export class LanguageStatsDto {
  @ApiProperty({
    description: 'Number of attempts',
    example: 25,
    type: 'number'
  })
  attempts: number;

  @ApiProperty({
    description: 'Average WPM',
    example: 45.2,
    type: 'number'
  })
  averageWpm: number;

  @ApiProperty({
    description: 'Best WPM',
    example: 68.5,
    type: 'number'
  })
  bestWpm: number;

  @ApiProperty({
    description: 'Average accuracy',
    example: 94.8,
    type: 'number'
  })
  averageAccuracy: number;
}

export class ProgressChartDto {
  @ApiProperty({
    description: 'Date',
    example: '2024-01-15',
    type: 'string'
  })
  date: string;

  @ApiProperty({
    description: 'Average WPM for the date',
    example: 45.2,
    type: 'number'
  })
  averageWpm: number;

  @ApiProperty({
    description: 'Average accuracy for the date',
    example: 94.8,
    type: 'number'
  })
  averageAccuracy: number;

  @ApiProperty({
    description: 'Number of attempts on the date',
    example: 5,
    type: 'number'
  })
  attemptsCount: number;
}

export class StatsDto {
  @ApiProperty({
    description: 'Total number of attempts',
    example: 127,
    type: 'number'
  })
  totalAttempts: number;

  @ApiProperty({
    description: 'Average WPM across all attempts',
    example: 45.2,
    type: 'number'
  })
  averageWpm: number;

  @ApiProperty({
    description: 'Best WPM achieved',
    example: 68.5,
    type: 'number'
  })
  bestWpm: number;

  @ApiProperty({
    description: 'Average accuracy across all attempts',
    example: 94.8,
    type: 'number'
  })
  averageAccuracy: number;

  @ApiProperty({
    description: 'Best accuracy achieved',
    example: 98.2,
    type: 'number'
  })
  bestAccuracy: number;

  @ApiProperty({
    description: 'Total time spent typing (seconds)',
    example: 3600,
    type: 'number'
  })
  totalTimeTyped: number;

  @ApiProperty({
    description: 'Total words typed',
    example: 15420,
    type: 'number'
  })
  totalWordsTyped: number;

  @ApiProperty({
    description: 'Personal bests by game mode',
    type: 'object'
  })
  personalBests: {
    timeMode: {
      [key: string]: PersonalBestDto;
    };
    wordMode: {
      [key: string]: PersonalBestDto;
    };
  };

  @ApiProperty({
    description: 'Statistics by language',
    type: 'object'
  })
  byLanguage: {
    UZBEK?: LanguageStatsDto;
    RUSSIAN?: LanguageStatsDto;
    ENGLISH?: LanguageStatsDto;
  };

  @ApiProperty({
    description: 'Progress chart data',
    type: [ProgressChartDto]
  })
  progressChart: ProgressChartDto[];
}

export class GetStatsResponseData {
  @ApiProperty({
    description: 'User statistics',
    type: StatsDto
  })
  stats: StatsDto;
}

// Leaderboard DTOs
export class LeaderboardEntryDto {
  @ApiProperty({
    description: 'Rank position',
    example: 1,
    type: 'number'
  })
  rank: number;

  @ApiProperty({
    description: 'Username',
    example: 'typing_master',
    type: 'string'
  })
  username: string;

  @ApiProperty({
    description: 'Metric value (WPM or accuracy)',
    example: 85.5,
    type: 'number'
  })
  value: number;

  @ApiProperty({
    description: 'Total attempts in this category',
    example: 42,
    type: 'number'
  })
  attempts: number;

  @ApiProperty({
    description: 'Best attempt details',
    type: 'object'
  })
  bestAttempt: {
    wpm: number;
    accuracy: number;
    date: string;
  };

  @ApiProperty({
    description: 'Is current user (if authenticated)',
    example: false,
    required: false,
    type: 'boolean'
  })
  isCurrentUser?: boolean;
}

export class LeaderboardContextDto {
  @ApiProperty({
    description: 'Leaderboard type',
    example: 'global',
    type: 'string'
  })
  type: string;

  @ApiProperty({
    description: 'Game mode filter',
    type: GameModeDto,
    required: false
  })
  gameMode?: GameModeDto;

  @ApiProperty({
    description: 'Language filter',
    example: Language.ENGLISH,
    enum: Language,
    required: false
  })
  language?: Language;

  @ApiProperty({
    description: 'Time period',
    example: 'all',
    type: 'string'
  })
  period: string;

  @ApiProperty({
    description: 'Ranking metric',
    example: 'wpm',
    type: 'string'
  })
  metric: string;
}

export class GetLeaderboardResponseData {
  @ApiProperty({
    description: 'Leaderboard entries',
    type: [LeaderboardEntryDto]
  })
  leaderboard: LeaderboardEntryDto[];

  @ApiProperty({
    description: 'Current user position (if authenticated)',
    type: LeaderboardEntryDto,
    required: false
  })
  currentUser?: LeaderboardEntryDto;

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto
  })
  pagination: PaginationDto;

  @ApiProperty({
    description: 'Context information',
    type: LeaderboardContextDto
  })
  context: LeaderboardContextDto;
}

// Session DTOs
export class SessionDto {
  @ApiProperty({
    description: 'Unique session identifier',
    example: 'session_507f1f77bcf86cd799439011',
    type: 'string'
  })
  sessionId: string;

  @ApiProperty({
    description: 'Text for typing',
    type: TextDto
  })
  text: TextDto;

  @ApiProperty({
    description: 'Game mode information',
    type: GameModeDto
  })
  gameMode: GameModeDto;

  @ApiProperty({
    description: 'Estimated duration (for time modes)',
    example: 60,
    required: false,
    type: 'number'
  })
  estimatedDuration?: number;

  @ApiProperty({
    description: 'Target words (for word modes)',
    example: 50,
    required: false,
    type: 'number'
  })
  targetWords?: number;

  @ApiProperty({
    description: 'Session start timestamp',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  startedAt: string;
}

export class StartSessionResponseData {
  @ApiProperty({
    description: 'Session information',
    type: SessionDto
  })
  session: SessionDto;
}

// Success Response Classes
export class CreateAttemptSuccessResponse extends SuccessResponse<CreateAttemptResponseData> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Attempt submitted successfully' })
  message: string;

  @ApiProperty({ type: CreateAttemptResponseData })
  data: CreateAttemptResponseData;
}

export class GetAttemptsSuccessResponse extends SuccessResponse<GetAttemptsResponseData> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Attempts retrieved successfully' })
  message: string;

  @ApiProperty({ type: GetAttemptsResponseData })
  data: GetAttemptsResponseData;
}

export class GetAttemptSuccessResponse extends SuccessResponse<GetAttemptResponseData> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Attempt retrieved successfully' })
  message: string;

  @ApiProperty({ type: GetAttemptResponseData })
  data: GetAttemptResponseData;
}

export class GetStatsSuccessResponse extends SuccessResponse<GetStatsResponseData> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Statistics retrieved successfully' })
  message: string;

  @ApiProperty({ type: GetStatsResponseData })
  data: GetStatsResponseData;
}

export class GetLeaderboardSuccessResponse extends SuccessResponse<GetLeaderboardResponseData> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Leaderboard retrieved successfully' })
  message: string;

  @ApiProperty({ type: GetLeaderboardResponseData })
  data: GetLeaderboardResponseData;
}

export class StartSessionSuccessResponse extends SuccessResponse<StartSessionResponseData> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Typing session started successfully' })
  message: string;

  @ApiProperty({ type: StartSessionResponseData })
  data: StartSessionResponseData;
}

// Error Response Classes
export class AttemptValidationErrorResponse extends ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 'BadRequestException' })
  error: string;

  @ApiProperty({ 
    example: ['WPM must be a number', 'Accuracy cannot exceed 100'],
    type: [String]
  })
  details: string[];
}

export class AttemptNotFoundErrorResponse extends ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Attempt not found' })
  message: string;

  @ApiProperty({ example: 'NotFoundException' })
  error: string;
}

export class AttemptUnauthorizedErrorResponse extends ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Authentication required for this resource' })
  message: string;

  @ApiProperty({ example: 'UnauthorizedException' })
  error: string;
}

export class AttemptInternalServerErrorResponse extends ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 500 })
  statusCode: number;

  @ApiProperty({ example: 'Internal server error occurred' })
  message: string;

  @ApiProperty({ example: 'InternalServerErrorException' })
  error: string;
}
