import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse {
  @ApiProperty({
    description: 'Indicates whether the request was successful',
    example: true,
    type: 'boolean'
  })
  success: boolean;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
    type: 'number'
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
    type: 'string'
  })
  message: string;

  constructor(success: boolean, statusCode: number, message: string) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class SuccessResponse<T = any> extends BaseResponse {
  @ApiProperty({
    description: 'Response data',
    required: false,
  })
  data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    super(true, statusCode, message);
    if (data !== undefined) {
      this.data = data;
    }
  }
}

export class ErrorResponse extends BaseResponse {
  @ApiProperty({
    description: 'Error type or code',
    example: 'ValidationError',
    required: false,
    type: 'string'
  })
  error?: string;

  @ApiProperty({
    description: 'Detailed error information',
    required: false,
    type: 'array',
    items: { type: 'string' }
  })
  details?: string[];

  constructor(statusCode: number, message: string, error?: string, details?: string[]) {
    super(false, statusCode, message);
    if (error) {
      this.error = error;
    }
    if (details && details.length > 0) {
      this.details = details;
    }
  }
}
