import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Language } from '@prisma/client';

export class GetTextsForGameDto {
  @ApiProperty({
    description: 'Game mode ID',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsString({ message: 'Game mode ID must be a string.' })
  gameModeId: string;

  @ApiProperty({
    description: 'Language for the texts',
    enum: Language,
    example: Language.ENGLISH,
    required: true,
  })
  @IsEnum(Language, { message: 'Language must be a valid language option.' })
  language: Language;
}
