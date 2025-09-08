import { ApiProperty } from '@nestjs/swagger';
import { GameModeType, Language } from '@prisma/client';

class GameModeInfo {
  @ApiProperty({
    description: 'Game mode ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Game mode type',
    enum: GameModeType,
    example: GameModeType.BY_WORD,
  })
  type: GameModeType;

  @ApiProperty({
    description: 'Game mode value (seconds for BY_TIME, word count for BY_WORD)',
    example: 50,
  })
  value: number;
}

export class GetGameTextSuccessResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'Game text retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: 'Game mode information',
    type: GameModeInfo,
  })
  gameMode: GameModeInfo;

  @ApiProperty({
    description: 'Text content for the game (full text for BY_TIME, truncated to word count for BY_WORD)',
    example: 'The quick brown fox jumps over the lazy dog and runs through the forest.',
  })
  content: string;

  @ApiProperty({
    description: 'Number of words in the returned content',
    example: 50,
  })
  wordCount: number;

  @ApiProperty({
    description: 'Language of the text',
    enum: Language,
    example: Language.ENGLISH,
  })
  language: Language;
}
