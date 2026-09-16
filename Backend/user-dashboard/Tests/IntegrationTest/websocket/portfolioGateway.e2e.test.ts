import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { io, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { PortfolioGateway } from '../../../src/modules/websocket/portfolio.gateway';

describe('E2E Integration — Socket.IO Real-Time Telemetry Gateway', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let portfolioGateway: PortfolioGateway;
  let serverPort: number;
  let validToken: string;

  const testUserId = 'usr-e2e-socket-001';

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
    cryptoHolding: { findMany: vi.fn().mockResolvedValue([]) },
    stockPosition: { findMany: vi.fn().mockResolvedValue([]) },
    aiFundPosition: { findMany: vi.fn().mockResolvedValue([]) },
    realEstateShare: { findMany: vi.fn().mockResolvedValue([]) },
    carShare: { findMany: vi.fn().mockResolvedValue([]) },
    ledgerAccount: { findMany: vi.fn().mockResolvedValue([]) },
    whitelistDestination: { findMany: vi.fn().mockResolvedValue([]) },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0); // Listen on random available port

    const address = app.getHttpServer().address() as AddressInfo;
    serverPort = address.port;

    jwtService = moduleFixture.get<JwtService>(JwtService);
    portfolioGateway = moduleFixture.get<PortfolioGateway>(PortfolioGateway);

    validToken = await jwtService.signAsync(
      {
        id: testUserId,
        email: 'realtime@wavyassets.com',
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_3',
        isCorporate: true,
      },
      { issuer: 'wavyassets.com', audience: 'wavyassets-client' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects and disconnects unauthenticated socket connections', async () => {
    const client: ClientSocket = io(`http://localhost:${serverPort}/ws/portfolio`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false,
    });

    const isDisconnected = await new Promise<boolean>((resolve) => {
      client.on('disconnect', () => resolve(true));
      client.on('connect_error', () => resolve(true));
      setTimeout(() => resolve(false), 3000);
    });

    client.close();
    expect(isDisconnected).toBe(true);
  });

  it('authenticates client with valid JWT, allows subscription, and receives broadcast ticks', async () => {
    const client: ClientSocket = io(`http://localhost:${serverPort}/ws/portfolio`, {
      auth: { token: validToken },
      transports: ['websocket'],
      reconnection: false,
    });

    // 1. Verify successful connection
    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => resolve());
      client.on('connect_error', (err) => reject(err));
    });

    expect(client.connected).toBe(true);

    // 2. Test portfolio:subscribe acknowledgment
    const subAck = await new Promise<{ status: string; room: string }>((resolve) => {
      client.emit('portfolio:subscribe', {}, (ack: { status: string; room: string }) => {
        resolve(ack);
      });
    });

    expect(subAck.status).toBe('SUBSCRIBED');
    expect(subAck.room).toBe(`user:${testUserId}`);

    // 3. Test real-time portfolio:tick event broadcast
    const tickData = {
      consolidatedNetWorth: 9850000.0,
      oneDayChange: 120500.0,
      oneDayPercentage: 1.24,
      timestamp: new Date().toISOString(),
    };

    const receivedTickPromise = new Promise<{
      consolidatedNetWorth: number;
      oneDayChange: number;
    }>((resolve) => {
      client.on('portfolio:tick', (data) => resolve(data));
    });

    // Gateway broadcasts tick to room user:<userId>
    portfolioGateway.broadcastPortfolioTick(testUserId, tickData);

    const receivedTick = await receivedTickPromise;
    expect(receivedTick.consolidatedNetWorth).toBe(9850000.0);
    expect(receivedTick.oneDayChange).toBe(120500.0);

    // 4. Test allocation:rebalanced event broadcast
    const rebalanceData = {
      trigger: 'DEPOSIT_SETTLED',
      assetId: 'wallet',
      symbol: 'USDC',
    };

    const receivedRebalancePromise = new Promise<{ trigger: string; assetId: string }>((resolve) => {
      client.on('allocation:rebalanced', (data) => resolve(data));
    });

    portfolioGateway.broadcastAllocationRebalanced(testUserId, rebalanceData);

    const receivedRebalance = await receivedRebalancePromise;
    expect(receivedRebalance.trigger).toBe('DEPOSIT_SETTLED');
    expect(receivedRebalance.assetId).toBe('wallet');

    client.disconnect();
  });
});
