import { describe, it, expect, beforeEach } from 'vitest';
import { useLiquidStore } from '../../src/store/useLiquidStore';
import { useAlternativeStore } from '../../src/store/useAlternativeStore';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';

describe('User Dynamic Values & Interactive Actions Tests', () => {
  beforeEach(() => {
    useLiquidStore.setState({
      dcaSchedules: [],
      activeOrders: [],
      unclaimedRewards: 18492.3,
    });
    usePortfolioStore.setState({
      netWorth: 14820450.0,
      availableCash: 1820450.0,
    });
  });

  describe('DCA Scheduler Dynamic Lifecycle', () => {
    it('is completely empty by default until a user configures a schedule', () => {
      const { dcaSchedules } = useLiquidStore.getState();
      expect(dcaSchedules).toHaveLength(0);
    });

    it('allows a user to add, pause/resume, and delete DCA schedules', () => {
      const store = useLiquidStore.getState();
      store.addDcaSchedule({
        asset: 'BTC',
        frequency: 'WEEKLY',
        amountUsd: 2500,
        sourceAccount: 'USD Operating Clearing',
        nextExecution: 'In 2 days',
        active: true,
      });

      let schedules = useLiquidStore.getState().dcaSchedules;
      expect(schedules).toHaveLength(1);
      expect(schedules[0].asset).toBe('BTC');
      expect(schedules[0].active).toBe(true);

      const scheduleId = schedules[0].id;

      // Toggle status (Pause)
      store.toggleDcaSchedule(scheduleId);
      expect(useLiquidStore.getState().dcaSchedules[0].active).toBe(false);

      // Toggle status back to Active
      store.toggleDcaSchedule(scheduleId);
      expect(useLiquidStore.getState().dcaSchedules[0].active).toBe(true);

      // Delete schedule
      store.deleteDcaSchedule(scheduleId);
      schedules = useLiquidStore.getState().dcaSchedules;
      expect(schedules).toHaveLength(0);
    });
  });

  describe('Active Limit Orders Execution Desk', () => {
    it('has zero limit orders by default and renders empty desk until placed', () => {
      const { activeOrders } = useLiquidStore.getState();
      expect(activeOrders).toHaveLength(0);
    });

    it('allows users to deploy and cancel limit orders dynamically', () => {
      const store = useLiquidStore.getState();
      store.addActiveOrder({
        symbol: 'NVDA',
        type: 'BUY_LIMIT',
        limitPrice: 135.0,
        shares: 500,
        status: 'PENDING',
        expires: 'GTC (Day End)',
      });

      let orders = useLiquidStore.getState().activeOrders;
      expect(orders).toHaveLength(1);
      expect(orders[0].symbol).toBe('NVDA');
      expect(orders[0].type).toBe('BUY_LIMIT');
      expect(orders[0].status).toBe('PENDING');

      const orderId = orders[0].id;
      store.cancelActiveOrder(orderId);
      orders = useLiquidStore.getState().activeOrders;
      expect(orders).toHaveLength(0);
    });
  });

  describe('Real Estate User Equity & Dynamic Yields', () => {
    it('updates holdings when user buys property tokens', () => {
      const store = useAlternativeStore.getState();
      const initialRe1Tokens = store.userRealEstateHoldings['re-1']?.tokens ?? 0;

      store.buyProperty('re-1', 100, 500);
      const updatedTokens = useAlternativeStore.getState().userRealEstateHoldings['re-1'].tokens;
      expect(updatedTokens).toBe(initialRe1Tokens + 100);
    });

    it('attaches new leases when user rents property units', () => {
      const store = useAlternativeStore.getState();
      store.leaseProperty('re-2', 12, 4500, 'Executive Floor Suite');
      const leases = useAlternativeStore.getState().userRealEstateHoldings['re-2'].leases;
      expect(leases.length).toBeGreaterThan(0);
      expect(leases[leases.length - 1].termMonths).toBe(12);
      expect(leases[leases.length - 1].monthlyRent).toBe(4500);
    });
  });
});
