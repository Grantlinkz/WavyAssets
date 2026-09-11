import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { TickerResponseDto, EnclaveTelemetryDto } from './dto/telemetry.dto';

@ApiTags('Syndicate Telemetry & Trust Infrastructure')
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('ticker')
  @ApiOperation({
    summary: 'Get multi-asset marquee ticker benchmarks',
    description:
      'Provides real-time rates, 24h percentage deltas, volume, and 7-day compressed sparkline curves for Crypto, Equities, Commodities, and Treasuries with circuit-breaker protection.',
  })
  @ApiResponse({
    status: 200,
    description: 'Multi-asset quote benchmarks returned successfully',
    type: TickerResponseDto,
  })
  async getTicker(): Promise<TickerResponseDto> {
    return this.telemetryService.getTickerQuotes();
  }

  @Get('enclave')
  @ApiOperation({
    summary: 'Get cryptographic Enclave proof-of-reserves telemetry',
    description:
      'Exposes live custody reserve Merkle root hash, Hardware Security Module (HSM) node operational status across Geneva, Zurich, and New York, clearing latency, and Tier AUM distribution.',
  })
  @ApiResponse({
    status: 200,
    description: 'Enclave cryptographic telemetry returned successfully',
    type: EnclaveTelemetryDto,
  })
  async getEnclave(): Promise<EnclaveTelemetryDto> {
    return this.telemetryService.getEnclaveTelemetry();
  }
}
