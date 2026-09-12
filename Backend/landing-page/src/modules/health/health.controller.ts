import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { HealthService, LivenessStatus, ReadinessStatus } from './health.service';
import { ApiResponseDto } from '../../common/interfaces/api-response.interface';

@ApiTags('Health & Readiness')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @ApiOperation({
    summary: 'Process liveness probe',
    description: 'Returns process uptime and basic availability status for container orchestration.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Service process is active and running',
    type: ApiResponseDto,
  })
  getLive(): LivenessStatus {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'System readiness probe',
    description:
      'Verifies SQLite database connectivity and memory metrics before routing live traffic.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Service dependencies and database are ready',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 503,
    description: 'Service is degraded or database is unreachable',
    type: ApiResponseDto,
  })
  async getReady(): Promise<ReadinessStatus> {
    return this.healthService.getReadiness();
  }
}
