import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Language } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTextDto {
  @ApiProperty({
    description: 'The language of the content. Can be UZBEK, RUSSIAN, or ENGLISH.',
    example: Language.UZBEK,
    enum: Language,
  })
  @IsNotEmpty({ message: 'Language is required.' })
  @IsEnum(Language, { message: `Language must be one of: ${Object.values(Language).join(', ')}.` })
  language: Language;

  @ApiProperty({
    description: 'The text content.',
    example: 'This is an example text in the chosen language.',
    maxLength: 1500,
  })
  @IsNotEmpty({ message: 'Content is required.' })
  @IsString({ message: 'Content must be a string.' })
  @MaxLength(1500, { message: 'Content must not exceed 1500 characters.' })
  content: string;
}
