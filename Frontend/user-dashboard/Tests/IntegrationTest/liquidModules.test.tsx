import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CryptoModule } from '../../src/components/modules/crypto/CryptoModule';
import { StocksModule } from '../../src/components/modules/stocks/StocksModule';
import { WalletModule } from '../../src/components/modules/wallet/WalletModule';
import { App } from '../../src/App';
import { useDashboardStore } from '../../src/store/useDashboardStore';

describe('Liquid Asset Modules Integration Tests', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      theme: 'dark',
      activeVertical: 'crypto',
      maskBalances: false,
    });
  });

  describe('CryptoModule SSR Rendering', () => {
    it('renders crypto module with blotter, custody badges, and unmasked figures', () => {
      const html = renderToString(<CryptoModule maskBalances={false} />);
      expect(html).toContain('data-testid="crypto-module"');
      expect(html).toContain('data-testid="crypto-holdings-table"');
      expect(html).toContain('BTC');
      expect(html).toContain('ETH');
      expect(html).toContain('SOL');
      expect(html).toContain('Sovereign MPC Cold');
      expect(html).toContain('ETH VALIDATOR NODE 04');
      expect(html).toContain('Automated Dollar-Cost Averaging (DCA) Scheduler');
      expect(html).toContain('$5,187,157.50');
    });

    it('respects privacy toggle and masks financial numbers when maskBalances is true', () => {
      const html = renderToString(<CryptoModule maskBalances={true} />);
      expect(html).toContain('data-testid="crypto-module"');
      expect(html).toContain('••••••••');
    });
  });

  describe('StocksModule SSR Rendering', () => {
    it('renders stocks module with Level-2 order book depth and position analytics', () => {
      const html = renderToString(<StocksModule maskBalances={false} />);
      expect(html).toContain('data-testid="stocks-module"');
      expect(html).toContain('data-testid="order-book-table"');
      expect(html).toContain('data-testid="position-analytics"');
      expect(html).toContain('data-testid="active-orders-hub"');
      expect(html).toContain('NVDA');
      expect(html).toContain('NVIDIA CORP DMA BLOCK');
      expect(html).toContain('138.82');
      expect(html).toContain('138.85');
      expect(html).toContain('0.94'); // Beta
      expect(html).toContain('$2,964,090.00');
    });

    it('renders pre-IPO assets and respects privacy masking', () => {
      const html = renderToString(<StocksModule maskBalances={true} />);
      expect(html).toContain('SPACEX');
      expect(html).toContain('ANTHROPIC');
      expect(html).toContain('••••••••');
    });
  });

  describe('WalletModule SSR Rendering', () => {
    it('renders wallet module with dual ledger split, fiat ramp, and transaction ledger', () => {
      const html = renderToString(<WalletModule maskBalances={false} />);
      expect(html).toContain('data-testid="wallet-module"');
      expect(html).toContain('Card A: Available Liquid Balance');
      expect(html).toContain('Card B: Invested &amp; Locked Capital');
      expect(html).toContain('$1,820,450.00');
      expect(html).toContain('$13,000,000.00');
      expect(html).toContain('Interactive Settlement Terminal');
      expect(html).toContain('Automated Sovereign Cash Sweep');
      expect(html).toContain('5.20% NET APY');
      expect(html).toContain('Zero-Markup Interbank Spot FX Desk');
      expect(html).toContain('Unified Historical Activity Ledger');
      expect(html).toContain('1. HSM Signed');
      expect(html).toContain('2. SNB / SIC Gate');
      expect(html).toContain('3. JPM NY Credited');
    });

    it('masks ledger cards when maskBalances is enabled', () => {
      const html = renderToString(<WalletModule maskBalances={true} />);
      expect(html).toContain('••••••••');
    });
  });

  describe('Dynamic Vertical Workspace App Swapping', () => {
    it('mounts CryptoModule when activeVertical is crypto', () => {
      const html = renderToString(<App activeVertical="crypto" />);
      expect(html).toContain('data-testid="crypto-module"');
      expect(html).not.toContain('data-testid="stocks-module"');
      expect(html).not.toContain('data-testid="wallet-module"');
    });

    it('mounts StocksModule when activeVertical is stocks', () => {
      const html = renderToString(<App activeVertical="stocks" />);
      expect(html).toContain('data-testid="stocks-module"');
      expect(html).not.toContain('data-testid="crypto-module"');
      expect(html).not.toContain('data-testid="wallet-module"');
    });

    it('mounts WalletModule when activeVertical is wallet', () => {
      const html = renderToString(<App activeVertical="wallet" />);
      expect(html).toContain('data-testid="wallet-module"');
      expect(html).not.toContain('data-testid="crypto-module"');
      expect(html).not.toContain('data-testid="stocks-module"');
    });
  });
});
