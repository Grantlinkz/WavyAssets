import { describe, it, expect, beforeEach } from 'vitest';
import { useAlternativeStore } from '../../src/store/useAlternativeStore';
import {
  REAL_ESTATE_ASSETS,
  RENTAL_DISTRIBUTION_HISTORY,
  INITIAL_OTC_ORDERS,
  REAL_ESTATE_SUMMARY_CARDS,
} from '../../src/lib/alternativeAssetData';

describe('Real Estate Module Telemetry & Store Unit Tests', () => {
  beforeEach(() => {
    useAlternativeStore.setState({
      selectedRegionFilter: 'ALL REGIONS',
      otcOrders: [...INITIAL_OTC_ORDERS],
      activeOtcTab: 'ALL',
      lastExecutedOrderId: null,
    });
  });

  it('validates 4-card executive real estate performance metrics', () => {
    expect(REAL_ESTATE_SUMMARY_CARDS).toHaveLength(4);

    const equityCard = REAL_ESTATE_SUMMARY_CARDS.find((c) =>
      c.label.includes('TOTAL PROPERTY EQUITY')
    );
    expect(equityCard?.value).toBe('$2,850,000.00');

    const yieldCard = REAL_ESTATE_SUMMARY_CARDS.find((c) =>
      c.label.includes('NET RENTAL YIELD')
    );
    expect(yieldCard?.value).toBe('$17,100.00');
    expect(yieldCard?.unit).toBe('/ mo');

    const capRateCard = REAL_ESTATE_SUMMARY_CARDS.find((c) =>
      c.label.includes('AVERAGE NET CAP RATE')
    );
    expect(capRateCard?.value).toBe('7.20%');

    const occupancyCard = REAL_ESTATE_SUMMARY_CARDS.find((c) =>
      c.label.includes('PORTFOLIO OCCUPANCY')
    );
    expect(occupancyCard?.value).toBe('98.4%');
  });

  it('verifies SPV property inventory valuations and fractional token counts', () => {
    expect(REAL_ESTATE_ASSETS.length).toBeGreaterThanOrEqual(50);

    const primaryValuation = REAL_ESTATE_ASSETS.slice(0, 4).reduce((sum, p) => sum + p.valuation, 0);
    expect(primaryValuation).toBe(2850000);

    const zurichSpv = REAL_ESTATE_ASSETS.find((p) => p.id === 're-1');
    expect(zurichSpv?.name).toBe('One Zurich Financial Center');
    expect(zurichSpv!.tokenCount * zurichSpv!.tokenPrice).toBe(zurichSpv?.valuation);
    expect(zurichSpv?.occupancyPct).toBe(100.0);
  });

  it('filters real estate assets by geographical jurisdiction', () => {
    const store = useAlternativeStore.getState();
    expect(store.selectedRegionFilter).toBe('ALL REGIONS');

    store.setRegionFilter('SWITZERLAND');
    expect(useAlternativeStore.getState().selectedRegionFilter).toBe('SWITZERLAND');

    const swissAssets = REAL_ESTATE_ASSETS.filter((a) => a.region === 'Switzerland');
    expect(swissAssets.length).toBeGreaterThanOrEqual(2);

    store.setRegionFilter('GERMANY');
    const germanAssets = REAL_ESTATE_ASSETS.filter((a) => a.region === 'Germany');
    expect(germanAssets.length).toBeGreaterThanOrEqual(1);
    expect(germanAssets[0].name).toBe('Frankfurt Hyperscale Data Hub');
  });

  it('calculates rental distribution history variances and confirms EVM cleared status', () => {
    expect(RENTAL_DISTRIBUTION_HISTORY.length).toBeGreaterThanOrEqual(6);

    RENTAL_DISTRIBUTION_HISTORY.forEach((item) => {
      expect(item.actual).toBeGreaterThanOrEqual(item.projected);
      expect(item.varianceDelta).toBe(item.actual - item.projected);
      expect(item.status).toBe('CLEARED');
      expect(item.settlementHash).toMatch(/^0x/);
    });
  });

  it('manages secondary OTC liquidity order book execution and fills', () => {
    const initialCount = INITIAL_OTC_ORDERS.length;
    expect(useAlternativeStore.getState().otcOrders).toHaveLength(initialCount);

    const orderToExecute = INITIAL_OTC_ORDERS[0];
    useAlternativeStore.getState().executeOtcOrder(orderToExecute.id);

    const updatedOrders = useAlternativeStore.getState().otcOrders;
    expect(updatedOrders).toHaveLength(initialCount - 1);
    expect(updatedOrders.find((o) => o.id === orderToExecute.id)).toBeUndefined();
    expect(useAlternativeStore.getState().lastExecutedOrderId).toBe(orderToExecute.id);
  });
});
