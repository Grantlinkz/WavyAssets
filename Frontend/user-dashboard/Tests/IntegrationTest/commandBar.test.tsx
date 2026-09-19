import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { GlobalCommandBar } from '../../src/components/command-bar/GlobalCommandBar';
import { useDashboardStore } from '../../src/store/useDashboardStore';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';

describe('GlobalCommandBar Integration Suite (Node 24 / SSR Parity)', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      maskBalances: false,
      timeframe: '1D',
    });
    usePortfolioStore.getState().resetToDefaults();
  });

  it('renders all 4 primary command bar sections', () => {
    const html = renderToString(<GlobalCommandBar />);

    expect(html).toContain('data-testid="global-command-bar"');
    expect(html).toContain('data-testid="net-worth-widget"');
    expect(html).toContain('data-testid="allocation-preview"');
    expect(html).toContain('data-testid="privacy-toggle-btn"');
    expect(html).toContain('data-testid="action-rail"');
  });

  it('displays default consolidated net worth ($14,820,450.00) and 1D PnL delta', () => {
    const html = renderToString(<GlobalCommandBar />);

    expect(html).toContain('$14,820,450.00');
    expect(html).toContain('+$184,210.40 (+1.26%)');
  });

  it('dynamically switches timeframe chips and updates PnL delta', () => {
    // 1W
    let html = renderToString(<GlobalCommandBar timeframe="1W" />);
    expect(html).toContain('+$412,850.00 (+2.86%)');

    // 1M
    html = renderToString(<GlobalCommandBar timeframe="1M" />);
    expect(html).toContain('+$920,400.00 (+6.62%)');

    // 1Y
    html = renderToString(<GlobalCommandBar timeframe="1Y" />);
    expect(html).toContain('+$2,480,120.00 (+20.09%)');

    // ALL
    html = renderToString(<GlobalCommandBar timeframe="ALL" />);
    expect(html).toContain('+$5,240,650.00 (+54.70%)');
  });

  it('toggles balance masking when maskBalances is true', () => {
    // Default unmasked
    let html = renderToString(<GlobalCommandBar maskBalances={false} />);
    expect(html).toContain('$14,820,450.00');
    expect(html).toContain('Hide Balances');

    // Mask balances
    html = renderToString(<GlobalCommandBar maskBalances={true} />);
    expect(html).toContain('••••••••');
    expect(html).not.toContain('$14,820,450.00');
    expect(html).toContain('Show Balances');
  });

  it('renders all 4 Action Rail buttons with institutional labels', () => {
    const html = renderToString(<GlobalCommandBar />);

    expect(html).toContain('Deposit');
    expect(html).toContain('Withdraw');
    expect(html).toContain('Trade / Swap');
    expect(html).toContain('KYC LEVEL 1');
  });

  it('triggers modal state transitions for all 4 action triggers', () => {
    const { openModal, closeModal } = usePortfolioStore.getState();

    openModal('deposit');
    expect(usePortfolioStore.getState().activeModal).toBe('deposit');

    openModal('withdraw');
    expect(usePortfolioStore.getState().activeModal).toBe('withdraw');

    openModal('trade');
    expect(usePortfolioStore.getState().activeModal).toBe('trade');

    openModal('kyc');
    expect(usePortfolioStore.getState().activeModal).toBe('kyc');

    closeModal();
    expect(usePortfolioStore.getState().activeModal).toBeNull();
  });
});
