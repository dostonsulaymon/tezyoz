import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Language, GameModeType } from '@prisma/client';

export class GetLeaderboardDto {
  @ApiProperty({
    description: 'Leaderboard type',
    enum: ['global', 'gameMode', 'language'],
    example: 'global',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Type must be a string.' })
  type?: 'global' | 'gameMode' | 'language' = 'global';

  @ApiProperty({
    description: 'Game mode type (required if type is gameMode)',
    enum: GameModeType,
    required: false
  })
  @IsOptional()
  @IsEnum(GameModeType, { message: 'Game mode type must be valid.' })
  gameModeType?: GameModeType;

  @ApiProperty({
    description: 'Game mode value (required if type is gameMode)',
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
    description: 'Language filter (required if type is language)',
    enum: Language,
    required: false
  })
  @IsOptional()
  @IsEnum(Language, { message: 'Language must be a valid language option.' })
  language?: Language;

  @ApiProperty({
    description: 'Time period for leaderboard',
    enum: ['daily', 'weekly', 'monthly', 'all'],
    example: 'all',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Period must be a string.' })
  period?: 'daily' | 'weekly' | 'monthly' | 'all' = 'all';

  @ApiProperty({
    description: 'Metric to rank by',
    enum: ['wpm', 'accuracy'],
    example: 'wpm',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Metric must be a string.' })
  metric?: 'wpm' | 'accuracy' = 'wpm';

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
    example: 10,
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
  limit?: number = 10;
}
