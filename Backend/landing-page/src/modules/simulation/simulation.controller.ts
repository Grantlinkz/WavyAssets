import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SimulationService } from './simulation.service';
import { SaveSimulationDto, SimulationResponseDto } from './dto/simulation.dto';

@ApiTags('Portfolio Simulation & Intent')
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Tokenize portfolio simulation intent',
    description:
      'Captures user capital allocation, risk posture profile, and projected APY, returning a cryptographic token for seamless client onboarding pre-fill.',
  })
  @ApiResponse({
    status: 201,
    description: 'Simulation intent tokenized successfully',
    type: SimulationResponseDto,
  })
  async save(@Body() dto: SaveSimulationDto): Promise<SimulationResponseDto> {
    return this.simulationService.saveSimulation(dto);
  }

  @Get(':token')
  @ApiOperation({
    summary: 'Retrieve simulation intent by token',
    description:
      'Resolves portfolio simulation parameters using a valid, non-expired intent token during account registration or terminal onboarding.',
  })
  @ApiParam({
    name: 'token',
    example: 'sim_a3f9c812d094b8e219084728d1c93a0b12e34f56',
    description: 'The cryptographic simulation intent token',
  })
  @ApiResponse({
    status: 200,
    description: 'Simulation intent resolved successfully',
    type: SimulationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Simulation intent not found or expired',
  })
  async getByToken(@Param('token') token: string): Promise<SimulationResponseDto> {
    return this.simulationService.getSimulation(token);
  }
}
