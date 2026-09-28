import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventsGateway } from '../../src/modules/events/events.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: any;
  let mockSocket: any;

  beforeEach(() => {
    gateway = new EventsGateway();
    mockServer = {
      emit: vi.fn(),
    };
    gateway.server = mockServer;

    mockSocket = {
      id: 'sock-12345',
      emit: vi.fn(),
    };
  });

  it('handleConnection should emit connection_established event', () => {
    gateway.handleConnection(mockSocket);

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'connection_established',
      expect.objectContaining({
        namespace: '/ws/admin',
        status: 'connected',
      }),
    );
  });

  it('handlePing should respond with pong', () => {
    const res = gateway.handlePing(mockSocket);

    expect(res.event).toBe('pong');
    expect(res.data.pong).toBe(true);
    expect(res.data.timestamp).toBeDefined();
  });

  it('emitSettlementUpdate should broadcast SETTLEMENT_UPDATE and settlement:update', () => {
    gateway.emitSettlementUpdate({
      txId: 'tx-100',
      status: 'SETTLED',
      amount: 50000,
    });

    expect(mockServer.emit).toHaveBeenCalledWith(
      'SETTLEMENT_UPDATE',
      expect.objectContaining({
        type: 'SETTLEMENT_UPDATE',
        txId: 'tx-100',
        status: 'SETTLED',
      }),
    );
    expect(mockServer.emit).toHaveBeenCalledWith('settlement:update', {
      txId: 'tx-100',
      status: 'SETTLED',
      amount: 50000,
    });
  });

  it('emitDepositPending should broadcast treasury:deposit_pending', () => {
    gateway.emitDepositPending({
      id: 'tx-dep-1',
      amount: 150000,
      rail: 'SWISS_SIC',
    });

    expect(mockServer.emit).toHaveBeenCalledWith(
      'treasury:deposit_pending',
      expect.objectContaining({
        type: 'treasury:deposit_pending',
        id: 'tx-dep-1',
      }),
    );
  });

  it('emitWithdrawalPending should broadcast treasury:withdrawal_pending', () => {
    gateway.emitWithdrawalPending({
      id: 'tx-wd-1',
      amount: 250000,
    });

    expect(mockServer.emit).toHaveBeenCalledWith(
      'treasury:withdrawal_pending',
      expect.objectContaining({
        type: 'treasury:withdrawal_pending',
        id: 'tx-wd-1',
      }),
    );
  });

  it('emitDepositRailUpdated should broadcast deposit_rail:updated', () => {
    gateway.emitDepositRailUpdated({
      railType: 'FIAT',
      fiat: { id: 'GLOBAL_FIAT_RAIL' },
    });

    expect(mockServer.emit).toHaveBeenCalledWith(
      'deposit_rail:updated',
      expect.objectContaining({
        type: 'deposit_rail:updated',
        railType: 'FIAT',
      }),
    );
  });
});
