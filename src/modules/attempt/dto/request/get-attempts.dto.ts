import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsString, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Language, GameModeType } from '@prisma/client';

export class GetAttemptsDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
    type: 'number'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer.' })
  @Min(1, { message: 'Page must be at least 1.' })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
    type: 'number'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @Max(100, { message: 'Limit must not exceed 100.' })
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by language',
    enum: Language,
    required: false
  })
  @IsOptional()
  @IsEnum(Language, { message: 'Language must be a valid language option.' })
  language?: Language;

  @ApiProperty({
    description: 'Filter by game mode type',
    enum: GameModeType,
    required: false
  })
  @IsOptional()
  @IsEnum(GameModeType, { message: 'Game mode type must be valid.' })
  gameModeType?: GameModeType;

  @ApiProperty({
    description: 'Filter by game mode value (seconds for time mode, words for word mode)',
    example: 30,
    required: false,
    type: 'number'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Game mode value must be an integer.' })
  @Min(1, { message: 'Game mode value must be positive.' })
  gameModeValue?: number;

  @ApiProperty({
    description: 'Sort by field',
    enum: ['createdAt', 'wpm', 'accuracy'],
    example: 'createdAt',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string.' })
  sortBy?: 'createdAt' | 'wpm' | 'accuracy' = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string.' })
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'Filter from date (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date from must be a valid ISO date string.' })
  dateFrom?: string;

  @ApiProperty({
    description: 'Filter to date (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date to must be a valid ISO date string.' })
  dateTo?: string;
}
