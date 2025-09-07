import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse, ErrorResponse } from '#/shared/dto/base-response.dto';
import { GameModeType } from '@prisma/client';

export class GameModeDto {
  @ApiProperty({
    description: 'Game mode unique identifier',
    example: '507f1f77bcf86cd799439011',
    type: 'string'
  })
  id: string;

  @ApiProperty({
    description: 'Game mode type',
    example: GameModeType.BY_TIME,
    enum: GameModeType
  })
  type: GameModeType;

  @ApiProperty({
    description: 'Game mode value (seconds for BY_TIME, words for BY_WORD)',
    example: 30,
    type: 'number'
  })
  value: number;
}

export class GetGameModesResponseData {
  @ApiProperty({
    description: 'List of available game modes',
    type: [GameModeDto]
  })
  gameModes: GameModeDto[];
}

// Success Responses
export class GetGameModesSuccessResponse extends SuccessResponse<GetGameModesResponseData> {
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
    example: 'Game modes retrieved successfully',
    description: 'Success message'
  })
  message: string;

  @ApiProperty({
    type: GetGameModesResponseData,
    description: 'Game modes data'
  })
  data: GetGameModesResponseData;
}

// Error Responses
export class GameModeInternalServerErrorResponse extends ErrorResponse {
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
