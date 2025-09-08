import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max, IsDateString } from 'class-validator';
import { Language } from '@prisma/client';

export class CreateAttemptDto {

  @ApiProperty({
    description: 'Language of the typing attempt',
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
    description: 'Words per minute achieved',
    example: 45.5,
    type: 'number',
    minimum: 0,
    maximum: 300
  })
  @IsNotEmpty({ message: 'WPM is required.' })
  @IsNumber({}, { message: 'WPM must be a number.' })
  @Min(0, { message: 'WPM cannot be negative.' })
  @Max(300, { message: 'WPM cannot exceed 300.' })
  wpm: number;

  @ApiProperty({
    description: 'Accuracy percentage (0-100)',
    example: 94.5,
    type: 'number',
    minimum: 0,
    maximum: 100
  })
  @IsNotEmpty({ message: 'Accuracy is required.' })
  @IsNumber({}, { message: 'Accuracy must be a number.' })
  @Min(0, { message: 'Accuracy cannot be negative.' })
  @Max(100, { message: 'Accuracy cannot exceed 100.' })
  accuracy: number;

  @ApiProperty({
    description: 'Number of typing errors made',
    example: 3,
    required: false,
    type: 'number',
    minimum: 0
  })
  @IsOptional()
  @IsNumber({}, { message: 'Errors must be a number.' })
  @Min(0, { message: 'Errors cannot be negative.' })
  errors?: number;

  @ApiProperty({
    description: 'Username for guest users (required if not authenticated)',
    example: 'guest_user_123',
    required: false,
    type: 'string',
    minLength: 3,
    maxLength: 30
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string.' })
  username?: string;
}
