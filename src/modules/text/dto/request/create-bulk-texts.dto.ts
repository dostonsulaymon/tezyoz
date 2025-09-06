import { IsArray, ValidateNested, ArrayMinSize, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTextDto } from './create-text.dto';

export class CreateBulkTextDto {
  @ApiProperty({
    description: 'An array of text objects to create in bulk.',
    type: [CreateTextDto],
  })
  @IsArray({ message: 'Texts must be an array.' })
  @ArrayMinSize(1, { message: 'At least one text must be provided.' })
  @ValidateNested({ each: true })
  @Type(() => CreateTextDto)
  texts: CreateTextDto[];
}
