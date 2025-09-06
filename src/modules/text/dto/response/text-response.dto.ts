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

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-16T14:20:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  updatedAt: string;
}

export class CreateTextResponseData {
  @ApiProperty({
    description: 'Created text information',
    type: TextDto
  })
  text: TextDto;
}

export class GetTextResponseData {
  @ApiProperty({
    description: 'Retrieved text information',
    type: TextDto
  })
  text: TextDto;
}

export class UpdateTextResponseData {
  @ApiProperty({
    description: 'Updated text information',
    type: TextDto
  })
  updatedText: TextDto;
}

export class DeleteTextResponseData {
  @ApiProperty({
    description: 'Deleted text information',
    type: TextDto
  })
  deletedText: TextDto;
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

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}

export class GetAllTextsResponseData {
  @ApiProperty({
    description: 'List of texts',
    type: [TextDto],
  })
  texts: TextDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}

export class GetAllTextsSuccessResponse extends SuccessResponse<GetAllTextsResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status',
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Texts retrieved successfully',
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    type: GetAllTextsResponseData,
    description: 'Retrieved texts with pagination data',
  })
  data: GetAllTextsResponseData;
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

export class GetTextSuccessResponse extends SuccessResponse<GetTextResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Text retrieved successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: GetTextResponseData,
    description: 'Retrieved text data'
  })
  data: GetTextResponseData;
}

export class UpdateTextSuccessResponse extends SuccessResponse<UpdateTextResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Text updated successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: UpdateTextResponseData,
    description: 'Updated text data'
  })
  data: UpdateTextResponseData;
}

export class DeleteTextSuccessResponse extends SuccessResponse<DeleteTextResponseData> {
  @ApiProperty({
    example: true,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Text deleted successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: DeleteTextResponseData,
    description: 'Deleted text data'
  })
  data: DeleteTextResponseData;
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

export class TextNotFoundErrorResponse extends ErrorResponse {
  @ApiProperty({
    example: false,
    description: 'Success status'
  })
  success: boolean;

  @ApiProperty({
    example: 404,
    description: 'HTTP status code'
  })
  statusCode: number;

  @ApiProperty({
    example: 'Text with ID "507f1f77bcf86cd799439011" not found.',
    description: 'Error message'
  })
  message: string;

  @ApiProperty({
    example: 'NotFoundException',
    description: 'Error type'
  })
  error: string;
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