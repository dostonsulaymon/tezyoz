import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { Language } from '@prisma/client';

export class UpdateTextDto {
  @ApiProperty({
    description: 'The language of the text content',
    enum: Language,
    example: Language.ENGLISH,
    required: false,
  })
  @IsOptional()
  @IsEnum(Language, { message: 'Language must be a valid language option.' })
  language?: Language;

  @ApiProperty({
    description: 'The text content to be updated',
    example: 'This is an updated text content.',
    maxLength: 1500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Content must be a string.' })
  @MaxLength(1500, { message: 'Content must not exceed 1500 characters.' })
  content?: string;
}