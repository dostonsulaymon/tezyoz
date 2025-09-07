import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GamemodeService } from './gamemode.service';
import {
  GetGameModesSuccessResponse,
  GameModeInternalServerErrorResponse
} from './dto/response/gamemode-response.dto';

@ApiTags('Game Mode')
@Controller('gamemode')
export class GamemodeController {
  constructor(private readonly gamemodeService: GamemodeService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all game modes',
    description: 'Retrieves all available game modes for typing tests' 
  })
  @ApiResponse({
    status: 200,
    description: 'Game modes retrieved successfully',
    type: GetGameModesSuccessResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: GameModeInternalServerErrorResponse,
  })
  async getAllGameModes() {
    return await this.gamemodeService.getAllGameModes();
  }
}
