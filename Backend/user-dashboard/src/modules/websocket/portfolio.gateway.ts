import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface PortfolioTickDto {
  consolidatedNetWorth: number;
  oneDayChange: number;
  oneDayPercentage: number;
  timestamp: string;
}

export interface AllocationRebalancedDto {
  trigger: string;
  assetId: string;
  symbol?: string;
  newAllocationMatrix?: unknown;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  namespace: '/ws/portfolio',
  cors: {
    origin: process.env.FRONTEND_ORIGINS
      ? process.env.FRONTEND_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
})
export class PortfolioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PortfolioGateway.name);
  private readonly lastTickTimes = new Map<string, number>();
  private readonly TICK_COOLDOWN_MS = 2000; // 2000ms broadcast throttling

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Handle incoming WebSocket connections with JWT authentication handshake
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Rejected unauthenticated connection attempt: ${client.id}`);
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        algorithms: ['HS256'],
        issuer: 'wavyassets.com',
        audience: 'wavyassets-client',
      });

      const userId = (payload.id as string) || (payload.sub as string);
      if (!userId) {
        this.logger.warn(`JWT payload missing user identifier: ${client.id}`);
        client.disconnect(true);
        return;
      }

      client.userId = userId;
      await client.join(`user:${userId}`);
      this.logger.log(`Client [${client.id}] authenticated and bound to room [user:${userId}]`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Authentication failed for socket [${client.id}]: ${errorMsg}`);
      client.disconnect(true);
    }
  }

  /**
   * Clean up on socket disconnect
   */
  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      this.logger.log(`Client [${client.id}] disconnected from room [user:${client.userId}]`);
    }
  }

  /**
   * Explicit client subscription handler
   */
  @SubscribeMessage('portfolio:subscribe')
  handlePortfolioSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() _payload: unknown,
  ): { status: string; room: string; timestamp: string } {
    const userId = client.userId;
    if (!userId) {
      return { status: 'UNAUTHENTICATED', room: '', timestamp: new Date().toISOString() };
    }

    return {
      status: 'SUBSCRIBED',
      room: `user:${userId}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Broadcast real-time portfolio ticks to authenticated user room
   * Throttled to max 1 emission per 2000ms to preserve UI visualizer rendering
   */
  broadcastPortfolioTick(userId: string, tick: PortfolioTickDto): boolean {
    const now = Date.now();
    const lastTick = this.lastTickTimes.get(userId) || 0;

    if (now - lastTick < this.TICK_COOLDOWN_MS) {
      return false; // Throttled
    }

    this.lastTickTimes.set(userId, now);
    if (this.server) {
      this.server.to(`user:${userId}`).emit('portfolio:tick', tick);
    }
    return true;
  }

  /**
   * Broadcast allocation rebalance events
   */
  broadcastAllocationRebalanced(userId: string, event: AllocationRebalancedDto): void {
    if (this.server) {
      this.server.to(`user:${userId}`).emit('allocation:rebalanced', event);
    }
  }

  /**
   * Broadcast available balance update events
   */
  broadcastBalanceUpdated(userId: string, data: { availableCash: number; currency: string }): void {
    if (this.server) {
      this.server.to(`user:${userId}`).emit('balance:updated', data);
    }
  }

  /**
   * Helper to extract JWT token from handshake auth, headers, or query
   */
  private extractToken(client: AuthenticatedSocket): string | null {
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    if (typeof client.handshake.query?.token === 'string') {
      return client.handshake.query.token;
    }

    return null;
  }
}
