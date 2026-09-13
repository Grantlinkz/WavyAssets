import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TelemetryService } from '../telemetry.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws/ticker',
})
export class TickerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TickerGateway.name);
  private broadcastInterval: NodeJS.Timeout | null = null;

  constructor(private readonly telemetryService: TelemetryService) {}

  afterInit(): void {
    this.logger.log('Ticker WebSocket Gateway initialized at /ws/ticker');
    // Broadcast live multi-asset quotes every 3 seconds to active subscribers
    this.broadcastInterval = setInterval(async () => {
      try {
        if (this.server) {
          const quotesData = await this.telemetryService.getTickerQuotes();
          this.server.emit('ticker:quotes', quotesData);
        }
      } catch (err) {
        this.logger.error('Error broadcasting ticker quotes via WebSocket', err);
      }
    }, 3000);
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected to live ticker feed: ${client.id}`);
    // Immediately emit current quotes to newly connected client
    this.telemetryService.getTickerQuotes().then((quotes) => {
      client.emit('ticker:quotes', quotes);
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected from ticker feed: ${client.id}`);
  }

  @SubscribeMessage('ticker:subscribe')
  async handleSubscribe(client: Socket): Promise<void> {
    const quotes = await this.telemetryService.getTickerQuotes();
    client.emit('ticker:quotes', quotes);
  }

  destroy(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
  }
}
