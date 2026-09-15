import { describe, it, expect, beforeEach } from 'vitest';
import {
  STOCKS_HOLDINGS_DATA,
  LEVEL_2_ORDER_BOOK,
} from '../../src/lib/liquidAssetData';
import { useLiquidStore } from '../../src/store/useLiquidStore';

describe('Stocks & Equities Module Unit Tests', () => {
  beforeEach(() => {
    useLiquidStore.setState({
      selectedStock: 'NVDA',
      isPreMarket: true,
      dripSettings: {
        NVDA: true,
        MSFT: true,
        SPACEX: false,
        ANTHROPIC: false,
      },
    });
  });

  it('verifies DMA Level-2 order book depth integrity and bid-ask spread', () => {
    expect(LEVEL_2_ORDER_BOOK.bids.length).toBeGreaterThanOrEqual(5);
    expect(LEVEL_2_ORDER_BOOK.asks.length).toBeGreaterThanOrEqual(5);

    const bestBid = LEVEL_2_ORDER_BOOK.bids[0].price;
    const bestAsk = LEVEL_2_ORDER_BOOK.asks[0].price;
    expect(bestBid).toBeLessThan(bestAsk);
    const spread = bestAsk - bestBid;
    expect(spread).toBeCloseTo(0.03, 2);

    // Cumulative depth check
    let cumBidSize = 0;
    LEVEL_2_ORDER_BOOK.bids.forEach((bid) => {
      cumBidSize += bid.size;
      expect(bid.total).toBe(cumBidSize);
    });
  });

  it('validates public equities vs pre-IPO distinction and quant metrics', () => {
    const publicStocks = STOCKS_HOLDINGS_DATA.filter((s) => !s.isPreIpo);
    const preIpoStocks = STOCKS_HOLDINGS_DATA.filter((s) => s.isPreIpo);

    expect(publicStocks.length).toBe(2);
    expect(preIpoStocks.length).toBe(2);

    // Beta values within expected ranges
    STOCKS_HOLDINGS_DATA.forEach((s) => {
      expect(s.beta).toBeGreaterThan(0.5);
      expect(s.beta).toBeLessThan(2.0);
      expect(s.unrealizedPnl).toBeGreaterThan(0);
    });

    const spacex = preIpoStocks.find((s) => s.symbol === 'SPACEX');
    expect(spacex).toBeDefined();
    expect(spacex?.shares).toBe(1000);
    expect(spacex?.custodian).toContain('Delaware Private SPV');
  });

  it('allows stock selection changes in useLiquidStore', () => {
    const store = useLiquidStore.getState();
    expect(store.selectedStock).toBe('NVDA');

    store.setSelectedStock('MSFT');
    expect(useLiquidStore.getState().selectedStock).toBe('MSFT');

    store.setSelectedStock('SPACEX');
    expect(useLiquidStore.getState().selectedStock).toBe('SPACEX');
  });

  it('allows toggling pre-market pricing feed and DRIP auto-reinvestment', () => {
    const store = useLiquidStore.getState();
    expect(store.isPreMarket).toBe(true);

    store.togglePreMarket();
    expect(useLiquidStore.getState().isPreMarket).toBe(false);

    expect(useLiquidStore.getState().dripSettings.NVDA).toBe(true);
    store.toggleDrip('NVDA');
    expect(useLiquidStore.getState().dripSettings.NVDA).toBe(false);

    expect(useLiquidStore.getState().dripSettings.SPACEX).toBe(false);
    store.toggleDrip('SPACEX');
    expect(useLiquidStore.getState().dripSettings.SPACEX).toBe(true);
  });
});
