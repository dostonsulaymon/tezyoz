import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max, IsDateString } from 'class-validator';
import { Language } from '@prisma/client';

export class CreateAttemptDto {

  @ApiProperty({
    description: 'Language of the typing attempt',
    example: Language.ENGLISH,
    enum: Language,
  })
  @IsNotEmpty({ message: 'Language is required.' })
  @IsEnum(Language, { message: `Language must be one of: ${Object.values(Language).join(', ')}.` })
  language: Language;

  @ApiProperty({
    description: 'User  ID',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsOptional()
  @IsString({ message: 'User  ID must be a string.' })
  userId: string;


  @ApiProperty({
    description: 'Game mode ID',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  @IsNotEmpty({ message: 'Game mode ID is required.' })
  @IsString({ message: 'Game mode ID must be a string.' })
  gameModeId: string;

  @ApiProperty({
    description: 'Words per minute achieved',
    example: 45.5,
    type: 'number',
    minimum: 0,
    maximum: 300,
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
    maximum: 100,
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
    minimum: 0,
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
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string.' })
  username?: string;

  @ApiProperty({
    description: 'Number of correctly typed characters',
    example: 150,
    type: 'number',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Correct characters count is required.' })
  @IsNumber({}, { message: 'Correct characters must be a number.' })
  @Min(0, { message: 'Correct characters cannot be negative.' })
  correctChars: number;

  @ApiProperty({
    description: 'Total number of characters in the text',
    example: 200,
    type: 'number',
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Total characters count is required.' })
  @IsNumber({}, { message: 'Total characters must be a number.' })
  @Min(1, { message: 'Total characters must be at least 1.' })
  totalChars: number;

  @ApiProperty({
    description: 'Time elapsed in seconds',
    example: 60,
    type: 'number',
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Time elapsed is required.' })
  @IsNumber({}, { message: 'Time elapsed must be a number.' })
  @Min(1, { message: 'Time elapsed must be at least 1 second.' })
  timeElapsed: number;
}
