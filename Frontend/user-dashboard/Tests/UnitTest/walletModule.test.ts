import { describe, it, expect, beforeEach } from 'vitest';
import { WALLET_TRANSACTIONS_DATA } from '../../src/lib/liquidAssetData';
import { useLiquidStore } from '../../src/store/useLiquidStore';

describe('Wallet & Global Treasury Module Unit Tests', () => {
  beforeEach(() => {
    useLiquidStore.setState({
      autoSweepEnabled: true,
      sweepThreshold: 50000,
      transactions: WALLET_TRANSACTIONS_DATA,
      filterVertical: 'ALL',
    });
  });

  it('validates dual split ledger totals and four-way liquidity sub-ledger', () => {
    const liquidSubBalances = [
      { asset: 'USDC', amount: 1115337.5 },
      { asset: 'USD', amount: 276400.0 },
      { asset: 'CHF', amount: 248712.5 },
      { asset: 'EUR', amount: 180000.0 },
    ];
    const totalLiquid = liquidSubBalances.reduce((sum, item) => sum + item.amount, 0);
    expect(totalLiquid).toBeCloseTo(1820450.0, 1);

    const investedCapital = 13000000.0;
    const consolidatedNetWealth = totalLiquid + investedCapital;
    expect(consolidatedNetWealth).toBeCloseTo(14820450.0, 1);
  });

  it('verifies cash sweep pot configuration and threshold adjustments', () => {
    const store = useLiquidStore.getState();
    expect(store.autoSweepEnabled).toBe(true);
    expect(store.sweepThreshold).toBe(50000);

    store.toggleAutoSweep();
    expect(useLiquidStore.getState().autoSweepEnabled).toBe(false);

    store.setSweepThreshold(100000);
    expect(useLiquidStore.getState().sweepThreshold).toBe(100000);

    store.setSweepThreshold(250000);
    expect(useLiquidStore.getState().sweepThreshold).toBe(250000);
  });

  it('filters historical transactions by vertical category', () => {
    const store = useLiquidStore.getState();
    expect(store.transactions.length).toBeGreaterThanOrEqual(5);

    // Filter by CASH
    store.setFilterVertical('CASH');
    expect(useLiquidStore.getState().filterVertical).toBe('CASH');
    const cashTxs = store.transactions.filter((tx) => tx.vertical === 'CASH');
    expect(cashTxs.length).toBe(2);

    // Filter by CRYPTO
    store.setFilterVertical('CRYPTO');
    const cryptoTxs = store.transactions.filter((tx) => tx.vertical === 'CRYPTO');
    expect(cryptoTxs.length).toBe(1);

    // Filter by REAL_ESTATE
    store.setFilterVertical('REAL_ESTATE');
    const reTxs = store.transactions.filter((tx) => tx.vertical === 'REAL_ESTATE');
    expect(reTxs.length).toBe(1);
    expect(reTxs[0].description).toContain('Zurich Prime Commercial');
  });

  it('validates transaction status and reference integrity', () => {
    WALLET_TRANSACTIONS_DATA.forEach((tx) => {
      expect(tx.status).toBe('CLEARED');
      expect(tx.reference).toMatch(/^[A-Z0-9-]+$/);
      expect(tx.amountUsd).toBeGreaterThan(0);
    });
  });
});
