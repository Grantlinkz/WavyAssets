import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { TickerGateway } from './gateways/ticker.gateway';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryService, TickerGateway],
  exports: [TelemetryService, TickerGateway],
})
export class TelemetryModule {}
