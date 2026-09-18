import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { PortfolioGateway, AuthenticatedSocket } from '../../../src/modules/websocket/portfolio.gateway';
import { Server } from 'socket.io';

describe('PortfolioGateway — Real-Time WebSocket Telemetry Gateway', () => {
  let gateway: PortfolioGateway;
  let mockJwtService: {
    verifyAsync: ReturnType<typeof vi.fn>;
  };
  let mockServer: {
    to: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
  };

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockJwtService = {
      verifyAsync: vi.fn(),
    };

    mockServer = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    gateway = new PortfolioGateway(mockJwtService as unknown as JwtService);
    gateway.server = mockServer as unknown as Server;
  });

  describe('handleConnection', () => {
    it('successfully authenticates client via handshake auth.token and joins user room', async () => {
      const mockSocket: Partial<AuthenticatedSocket> = {
        id: 'sock-001',
        handshake: {
          auth: { token: 'valid-jwt-token' },
          headers: {},
          query: {},
        } as unknown as AuthenticatedSocket['handshake'],
        join: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn(),
      };

      mockJwtService.verifyAsync.mockResolvedValue({
        id: testUserId,
        email: 'investor@wavyassets.com',
      });

      await gateway.handleConnection(mockSocket as AuthenticatedSocket);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token', {
        algorithms: ['HS256'],
        issuer: 'wavyassets.com',
        audience: 'wavyassets-client',
      });
      expect(mockSocket.userId).toBe(testUserId);
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${testUserId}`);
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('successfully extracts token from Authorization header (Bearer prefix)', async () => {
      const mockSocket: Partial<AuthenticatedSocket> = {
        id: 'sock-002',
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer bearer-jwt-token' },
          query: {},
        } as unknown as AuthenticatedSocket['handshake'],
        join: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn(),
      };

      mockJwtService.verifyAsync.mockResolvedValue({
        sub: testUserId,
        email: 'investor@wavyassets.com',
      });

      await gateway.handleConnection(mockSocket as AuthenticatedSocket);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('bearer-jwt-token', expect.any(Object));
      expect(mockSocket.userId).toBe(testUserId);
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${testUserId}`);
    });

    it('disconnects client when no token is provided in handshake', async () => {
      const mockSocket: Partial<AuthenticatedSocket> = {
        id: 'sock-unauth',
        handshake: {
          auth: {},
          headers: {},
          query: {},
        } as unknown as AuthenticatedSocket['handshake'],
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      await gateway.handleConnection(mockSocket as AuthenticatedSocket);

      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('disconnects client when JWT verification fails', async () => {
      const mockSocket: Partial<AuthenticatedSocket> = {
        id: 'sock-invalid',
        handshake: {
          auth: { token: 'expired-or-tampered-token' },
          headers: {},
          query: {},
        } as unknown as AuthenticatedSocket['handshake'],
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await gateway.handleConnection(mockSocket as AuthenticatedSocket);

      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it('disconnects client when JWT payload is missing user ID', async () => {
      const mockSocket: Partial<AuthenticatedSocket> = {
        id: 'sock-no-id',
        handshake: {
          auth: { token: 'token-without-id' },
          headers: {},
          query: {},
        } as unknown as AuthenticatedSocket['handshake'],
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      mockJwtService.verifyAsync.mockResolvedValue({
        someOtherField: 'no-sub-or-id',
      });

      await gateway.handleConnection(mockSocket as AuthenticatedSocket);

      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('handlePortfolioSubscribe', () => {
    it('confirms subscription for authenticated client', () => {
      const mockSocket: Partial<AuthenticatedSocket> = {
        id: 'sock-sub',
        userId: testUserId,
      };

      const res = gateway.handlePortfolioSubscribe(mockSocket as AuthenticatedSocket, {});

      expect(res.status).toBe('SUBSCRIBED');
      expect(res.room).toBe(`user:${testUserId}`);
      expect(res.timestamp).toBeDefined();
    });

    it('returns UNAUTHENTICATED when socket has no userId bound', () => {
      const mockSocket: Partial<AuthenticatedSocket> = {
        id: 'sock-unauth-sub',
      };

      const res = gateway.handlePortfolioSubscribe(mockSocket as AuthenticatedSocket, {});

      expect(res.status).toBe('UNAUTHENTICATED');
    });
  });

  describe('broadcastPortfolioTick & Throttling SLA', () => {
    it('broadcasts tick to user room and throttles emissions within 2000ms', () => {
      const tickData = {
        consolidatedNetWorth: 14820450.0,
        oneDayChange: 184210.4,
        oneDayPercentage: 1.26,
        timestamp: new Date().toISOString(),
      };

      // First broadcast -> should succeed
      const firstEmit = gateway.broadcastPortfolioTick(testUserId, tickData);
      expect(firstEmit).toBe(true);
      expect(mockServer.to).toHaveBeenCalledWith(`user:${testUserId}`);
      expect(mockServer.emit).toHaveBeenCalledWith('portfolio:tick', tickData);

      // Immediate second broadcast -> should be throttled
      const throttledEmit = gateway.broadcastPortfolioTick(testUserId, tickData);
      expect(throttledEmit).toBe(false);
      // Emission count should still be 1
      expect(mockServer.emit).toHaveBeenCalledTimes(1);
    });

    it('allows broadcast after 2000ms cooldown window has elapsed', () => {
      const tickData = {
        consolidatedNetWorth: 14820450.0,
        oneDayChange: 184210.4,
        oneDayPercentage: 1.26,
        timestamp: new Date().toISOString(),
      };

      vi.useFakeTimers();
      try {
        gateway.broadcastPortfolioTick(testUserId, tickData);
        expect(mockServer.emit).toHaveBeenCalledTimes(1);

        // Advance timers by 2001ms
        vi.advanceTimersByTime(2001);

        const nextEmit = gateway.broadcastPortfolioTick(testUserId, tickData);
        expect(nextEmit).toBe(true);
        expect(mockServer.emit).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('broadcastAllocationRebalanced', () => {
    it('emits allocation:rebalanced event to target user room', () => {
      const eventData = {
        trigger: 'ORDER_FILLED',
        assetId: 'stocks',
        symbol: 'NVDA',
      };

      gateway.broadcastAllocationRebalanced(testUserId, eventData);

      expect(mockServer.to).toHaveBeenCalledWith(`user:${testUserId}`);
      expect(mockServer.emit).toHaveBeenCalledWith('allocation:rebalanced', eventData);
    });
  });
});
