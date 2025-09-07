import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'currentPassword123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Current password must be at least 8 characters long' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newSecurePassword123!',
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'newSecurePassword123!',
  })
  @IsString()
  confirmPassword: string;
}