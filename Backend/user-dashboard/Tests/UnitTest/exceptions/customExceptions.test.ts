import { describe, it, expect } from 'vitest';
import {
  InvalidHandoffTicketException,
  QuarantineTimeLockException,
  LedgerImbalanceException,
  InsufficientAvailableBalanceException,
  CircuitBreakerTriggeredException,
} from '../../../src/common/exceptions';
import { ERROR_CODES } from '../../../src/common/constants/system.constants';

describe('Custom Domain Exceptions', () => {
  it('InvalidHandoffTicketException sets HTTP 401 and ERR_INVALID_HANDOFF_TICKET', () => {
    const ex = new InvalidHandoffTicketException();
    expect(ex.getStatus()).toBe(401);
    const response = ex.getResponse() as Record<string, unknown>;
    expect(response['errorCode']).toBe(ERROR_CODES.ERR_INVALID_HANDOFF_TICKET);
  });

  it('QuarantineTimeLockException sets HTTP 403 and ERR_DESTINATION_QUARANTINED with unlock timestamp', () => {
    const unlockTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const ex = new QuarantineTimeLockException(
      'Target address is quarantined.',
      unlockTime,
    );
    expect(ex.getStatus()).toBe(403);
    const response = ex.getResponse() as Record<string, unknown>;
    expect(response['errorCode']).toBe(ERROR_CODES.ERR_DESTINATION_QUARANTINED);
    expect(response['quarantineUntil']).toBe(unlockTime.toISOString());
  });

  it('LedgerImbalanceException sets HTTP 422 and ERR_LEDGER_IMBALANCE with netImbalance', () => {
    const ex = new LedgerImbalanceException('Imbalanced ledger entry', 150.25);
    expect(ex.getStatus()).toBe(422);
    const response = ex.getResponse() as Record<string, unknown>;
    expect(response['errorCode']).toBe(ERROR_CODES.ERR_LEDGER_IMBALANCE);
    expect(response['netImbalance']).toBe(150.25);
  });

  it('InsufficientAvailableBalanceException sets HTTP 422 and ERR_INSUFFICIENT_FUNDS', () => {
    const ex = new InsufficientAvailableBalanceException(
      'Order exceeds available balance',
      5000,
      1200,
    );
    expect(ex.getStatus()).toBe(422);
    const response = ex.getResponse() as Record<string, unknown>;
    expect(response['errorCode']).toBe(ERROR_CODES.ERR_INSUFFICIENT_FUNDS);
    expect(response['requestedAmount']).toBe(5000);
    expect(response['availableBalance']).toBe(1200);
  });

  it('CircuitBreakerTriggeredException sets HTTP 403 and ERR_CIRCUIT_BREAKER_ACTIVE', () => {
    const ex = new CircuitBreakerTriggeredException();
    expect(ex.getStatus()).toBe(403);
    const response = ex.getResponse() as Record<string, unknown>;
    expect(response['errorCode']).toBe(ERROR_CODES.ERR_CIRCUIT_BREAKER_ACTIVE);
  });
});
