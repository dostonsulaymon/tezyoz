import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse, ErrorResponse } from '#/shared/dto/base-response.dto';
import { Language } from '@prisma/client';

export class TextDto {
  @ApiProperty({
    description: 'Text unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'The language of the content',
    example: Language.UZBEK,
    enum: Language,
  })
  language: Language;

  @ApiProperty({
    description: 'The text content',
    example: 'This is an example text in the chosen language.',
    type: 'string'
  })
  content: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  createdAt: string;
}

export class CreateTextResponseData {
  @ApiProperty({
    description: 'Created text information',
    type: TextDto
  })
  text: TextDto;
}

export class BulkTextResponseData {
  @ApiProperty({
    description: 'List of created texts',
    type: [TextDto]
  })
  texts: TextDto[];

  @ApiProperty({
    description: 'Number of successfully created texts',
    example: 5,
    type: 'number'
  })
  count: number;
}

export class CreateTextSuccessResponse extends SuccessResponse<CreateTextResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 201,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Text created successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: CreateTextResponseData,
    description: 'Created text data'
  })
  data: CreateTextResponseData;
}

export class CreateBulkTextSuccessResponse extends SuccessResponse<BulkTextResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 201,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bulk texts created successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: BulkTextResponseData,
    description: 'Bulk creation response data'
  })
  data: BulkTextResponseData;
}

export class TextValidationErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 400,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'BadRequestException',
    description: 'Error type'
  })
  error: string;

  @ApiProperty({
    example: [
      'Language is required.',
      'Content is required.',
      'Content must not exceed 1500 characters.'
    ],
    description: 'Validation error details',
    type: [String]
  })
  details: string[];
}

export class InternalServerErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 500,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Internal server error occurred',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'InternalServerErrorException',
    description: 'Error type'
  })
  error: string;
}