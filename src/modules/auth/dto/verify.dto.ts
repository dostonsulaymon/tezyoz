import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty({
    description: 'User email address for verification',
    example: 'user@example.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'OTP verification code',
    example: '12345',
    minLength: 5,
    maxLength: 5,
    pattern: '^[0-9]{5}$',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(5)
  @IsNotEmpty()
  code: string;
}