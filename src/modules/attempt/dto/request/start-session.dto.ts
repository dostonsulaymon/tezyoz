import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Language } from '@prisma/client';

export class StartSessionDto {
  @ApiProperty({
    description: 'Language for the typing session',
    example: Language.ENGLISH,
    enum: Language
  })
  @IsNotEmpty({ message: 'Language is required.' })
  @IsEnum(Language, { message: `Language must be one of: ${Object.values(Language).join(', ')}.` })
  language: Language;

  @ApiProperty({
    description: 'Game mode ID',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  @IsNotEmpty({ message: 'Game mode ID is required.' })
  @IsString({ message: 'Game mode ID must be a string.' })
  gameModeId: string;

  @ApiProperty({
    description: 'Specific text ID (optional)',
    example: '507f1f77bcf86cd799439011',
    required: false,
    type: 'string'
  })
  @IsOptional()
  @IsString({ message: 'Text ID must be a string.' })
  textId?: string;
}
