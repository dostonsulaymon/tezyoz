import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Language } from '@prisma/client';

export class GetStatsDto {
  @ApiProperty({
    description: 'Time period for statistics',
    enum: ['7d', '30d', '90d', '1y', 'all'],
    example: 'all',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Period must be a string.' })
  period?: '7d' | '30d' | '90d' | '1y' | 'all' = 'all';

  @ApiProperty({
    description: 'Filter statistics by language',
    enum: Language,
    required: false
  })
  @IsOptional()
  @IsEnum(Language, { message: 'Language must be a valid language option.' })
  language?: Language;
}
