import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';


export class DeleteUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@tezyoz.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}