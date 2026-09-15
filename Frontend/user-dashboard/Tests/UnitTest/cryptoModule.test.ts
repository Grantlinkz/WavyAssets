import { describe, it, expect, beforeEach } from 'vitest';
import {
  CRYPTO_HOLDINGS_DATA,
  INITIAL_DCA_SCHEDULES,
  type CustodyBadge,
} from '../../src/lib/liquidAssetData';
import { useLiquidStore } from '../../src/store/useLiquidStore';

describe('Crypto Module Unit Tests', () => {
  beforeEach(() => {
    useLiquidStore.setState({
      dcaSchedules: INITIAL_DCA_SCHEDULES,
      unclaimedRewards: 18492.30,
      isCompounding: false,
    });
  });

  it('verifies crypto holdings blotter total market value and P&L calculations', () => {
    expect(CRYPTO_HOLDINGS_DATA.length).toBeGreaterThanOrEqual(4);

    const btcHolding = CRYPTO_HOLDINGS_DATA.find((h) => h.symbol === 'BTC');
    expect(btcHolding).toBeDefined();
    if (btcHolding) {
      expect(btcHolding.balance).toBe(42.5);
      expect(btcHolding.spotPrice).toBe(89420.0);
      const totalVal = btcHolding.balance * btcHolding.spotPrice;
      expect(totalVal).toBeCloseTo(3800350.0, 1);
      expect(btcHolding.custodyType).toBe('SOVEREIGN_CUSTODY');
    }

    const ethHolding = CRYPTO_HOLDINGS_DATA.find((h) => h.symbol === 'ETH');
    expect(ethHolding).toBeDefined();
    if (ethHolding) {
      expect(ethHolding.custodyType).toBe('STAKING_LOCKUP');
      expect(ethHolding.stakingApy).toBe(3.82);
    }
  });

  it('validates institutional custody badge classifications', () => {
    const validBadges: CustodyBadge[] = ['SOVEREIGN_CUSTODY', 'STAKING_LOCKUP', 'EXTERNAL_WEB3'];
    CRYPTO_HOLDINGS_DATA.forEach((holding) => {
      expect(validBadges).toContain(holding.custodyType);
      expect(holding.riskRating).toMatch(/^(AAA|AA\+|AA|A\+)$/);
    });
  });

  it('allows toggling DCA schedule active state', () => {
    const store = useLiquidStore.getState();
    const targetSchedule = store.dcaSchedules[0];
    const initialActive = targetSchedule.active;

    store.toggleDcaSchedule(targetSchedule.id);
    const updated = useLiquidStore.getState().dcaSchedules.find((s) => s.id === targetSchedule.id);
    expect(updated?.active).toBe(!initialActive);

    // Toggle back
    useLiquidStore.getState().toggleDcaSchedule(targetSchedule.id);
    const reverted = useLiquidStore.getState().dcaSchedules.find((s) => s.id === targetSchedule.id);
    expect(reverted?.active).toBe(initialActive);
  });

  it('allows adding a new institutional DCA deployment schedule', () => {
    const initialCount = useLiquidStore.getState().dcaSchedules.length;
    useLiquidStore.getState().addDcaSchedule({
      asset: 'BTC',
      frequency: 'BI_WEEKLY',
      amountUsd: 100000,
      sourceAccount: 'Geneva Treasury Vault',
      nextExecution: 'In 2 days',
      active: true,
    });

    const newSchedules = useLiquidStore.getState().dcaSchedules;
    expect(newSchedules.length).toBe(initialCount + 1);
    const created = newSchedules[newSchedules.length - 1];
    expect(created.amountUsd).toBe(100000);
    expect(created.asset).toBe('BTC');
    expect(created.frequency).toBe('BI_WEEKLY');
  });

  it('triggers fast compounding state transition', () => {
    const store = useLiquidStore.getState();
    expect(store.unclaimedRewards).toBeGreaterThan(0);
    expect(store.isCompounding).toBe(false);

    store.triggerFastCompound();
    expect(useLiquidStore.getState().isCompounding).toBe(true);
  });
});
