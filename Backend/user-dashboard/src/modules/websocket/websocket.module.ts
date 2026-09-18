import { Module } from '@nestjs/common';
import { PortfolioGateway } from './portfolio.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PortfolioGateway],
  exports: [PortfolioGateway],
})
export class WebsocketModule {}
