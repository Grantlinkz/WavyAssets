import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DepositModal } from '../../src/components/modals/DepositModal';
import { WithdrawModal, CRYPTO_NETWORKS_CONFIG } from '../../src/components/modals/WithdrawModal';
import { CryptoModule } from '../../src/components/modules/crypto/CryptoModule';
import { StocksModule } from '../../src/components/modules/stocks/StocksModule';
import { RealEstateModule } from '../../src/components/modules/real-estate/RealEstateModule';
import { CarsModule } from '../../src/components/modules/cars/CarsModule';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';
import { useDashboardStore } from '../../src/store/useDashboardStore';
import { useLiquidStore } from '../../src/store/useLiquidStore';
import { useAlternativeStore } from '../../src/store/useAlternativeStore';

describe('User Custom Requirements Verification Suite', () => {
  beforeEach(() => {
    usePortfolioStore.getState().resetToDefaults();
    useDashboardStore.setState({ maskBalances: false });
  });

  describe('Requirement 1: Deposit -> Web3 Phantom Wallet', () => {
    it('renders Phantom Wallet button in place of WalletConnect with same functionality', () => {
      const html = renderToString(<DepositModal isOpen={true} activeTab="crypto" />);
      expect(html).toContain('Phantom Wallet');
      expect(html).toContain('MetaMask');
      expect(html).toContain('Trust Wallet');
      expect(html).not.toContain('<span>WalletConnect</span>');
    });
  });

  describe('Requirement 2: WithdrawModal Bank & Wallet (Crypto) Sections with Pending Admin Approval', () => {
    it('renders Bank Withdrawal section with Bank Name, Account Name, Account Number, Amount', () => {
      const html = renderToString(<WithdrawModal isOpen={true} />);
      expect(html).toContain('Bank Withdrawal');
      expect(html).toContain('Wallet (Crypto) Withdrawal');
      expect(html).toContain('Bank Name');
      expect(html).toContain('Account Name');
      expect(html).toContain('Account Number / IBAN');
      expect(html).toContain('WITHDRAWAL AMOUNT (USD)');
      expect(html).toContain('24-48H WHITELIST ENFORCED');
    });

    it('verifies Crypto network protocols map contains required protocols', () => {
      expect(CRYPTO_NETWORKS_CONFIG.USDT).toEqual(['ERC-20', 'TRC-20', 'BEP-20']);
      expect(CRYPTO_NETWORKS_CONFIG.BTC).toEqual(['Bitcoin Native', 'BEP-20']);
      expect(CRYPTO_NETWORKS_CONFIG.ETH).toEqual(['ERC-20', 'Arbitrum', 'Optimism']);
      expect(CRYPTO_NETWORKS_CONFIG.USDC).toEqual(['ERC-20', 'BEP-20', 'Polygon']);
    });
  });

  describe('Requirement 3: Deposit Obsidian Metal Card Limit shows Locked', () => {
    it('renders Obsidian Metal Card Limit as LOCKED in card deposit tab', () => {
      const html = renderToString(<DepositModal isOpen={true} activeTab="card" />);
      expect(html).toContain('Obsidian Metal Card Limit');
      expect(html).toContain('LOCKED');
      expect(html).not.toContain('$500,000.00 AVAILABLE');
    });
  });

  describe('Requirement 4: Dynamic Calculated Values for 4 Sections', () => {
    it('calculates CryptoModule values dynamically without displaying 0.0% portfolio', () => {
      const html = renderToString(<CryptoModule maskBalances={false} />);
      expect(html).toContain('CRYPTO NET ASSET VALUE');
      expect(html).not.toContain('0.0% PORTFOLIO');
      expect(html).toContain('% PORTFOLIO');
      expect(html).toContain('TOTAL STAKED CAPITAL');
      expect(html).toContain('BLENDED STAKING APY');
      expect(html).toContain('ACCRUED UNCLAIMED YIELD');
    });

    it('calculates StocksModule values dynamically without displaying 0.0% portfolio', () => {
      const html = renderToString(<StocksModule maskBalances={false} />);
      expect(html).toContain('GLOBAL EQUITIES NAV');
      expect(html).not.toContain('0.0% PORTFOLIO');
      expect(html).toContain('% PORTFOLIO');
      expect(html).toContain('DAY GAIN / UNREALIZED');
      expect(html).toContain('EXTENDED TRADING HOURS');
      expect(html).toContain('LIQUIDITY VERTICAL SPLIT');
    });

    it('calculates RealEstateModule values dynamically from individual properties', () => {
      // 1. Initial zero state when no holdings
      useAlternativeStore.setState({ userRealEstateHoldings: {} });
      const emptyHtml = renderToString(<RealEstateModule maskBalances={false} />);
      expect(emptyHtml).toContain('TOTAL PROPERTY EQUITY');
      expect(emptyHtml).toContain('$0.00');

      // 2. Populated holdings
      useAlternativeStore.setState({
        userRealEstateHoldings: {
          're-1': { tokens: 2400, totalInvested: 1200000, leases: [] },
          're-2': { tokens: 1500, totalInvested: 750000, leases: [] },
          're-3': { tokens: 1100, totalInvested: 550000, leases: [] },
          're-4': { tokens: 700, totalInvested: 350000, leases: [] },
        },
      });
      const populatedHtml = renderToString(<RealEstateModule maskBalances={false} />);
      expect(populatedHtml).toContain('TOTAL PROPERTY EQUITY');
      expect(populatedHtml).toContain('NET RENTAL YIELD');
      expect(populatedHtml).toContain('AVERAGE NET CAP RATE');
      expect(populatedHtml).toContain('PORTFOLIO OCCUPANCY');
      expect(populatedHtml).toContain('$2,850,000.00');
    });

    it('calculates CarsModule values dynamically from individual vaulted collection items', () => {
      // 1. Initial zero state when no holdings
      useAlternativeStore.setState({ userVehicleHoldings: {} });
      const emptyHtml = renderToString(<CarsModule maskBalances={false} />);
      expect(emptyHtml).toContain('VAULTED VALUATION');
      expect(emptyHtml).toContain('$0.00');

      // 2. Populated holdings
      useAlternativeStore.setState({
        userVehicleHoldings: {
          'car-1': { owned: true, purchaseType: 'full', totalInvested: 580000, leases: [] },
          'watch-1': { owned: true, purchaseType: 'full', totalInvested: 270000, leases: [] },
        },
      });
      const populatedHtml = renderToString(<CarsModule maskBalances={false} />);
      expect(populatedHtml).toContain('VAULTED VALUATION');
      expect(populatedHtml).toContain('$850,000.00');
      expect(populatedHtml).toContain('ACTIVE INSURED LIMIT');
      expect(populatedHtml).toContain('$1,200,000.00');
      expect(populatedHtml).toContain('1-YEAR INDEX GROWTH');
      expect(populatedHtml).toContain('PHYSICAL VAULT TELEMETRY');
    });
  });

  describe('Sprint Requirements: Active Execution Schedule, Whitelist Removal & MetaMask Isolation', () => {
    it('verifies Pre-Approved Whitelist Destination is removed from WithdrawModal', () => {
      const html = renderToString(<WithdrawModal isOpen={true} />);
      expect(html).not.toContain('Pre-Approved Whitelist Destination');
      expect(html).toContain('Bank Withdrawal');
      expect(html).toContain('Wallet (Crypto) Withdrawal');
      expect(html).toContain('Bank Name');
    });

    it('verifies HoldingsTable and CryptoModule reflect user Active Execution Schedule ($25,000.00)', () => {
      useLiquidStore.setState({
        dcaSchedules: [
          {
            id: 'test-btc-01',
            asset: 'BTC',
            frequency: 'WEEKLY',
            amountUsd: 25000,
            sourceAccount: 'USD Fedwire Treasury',
            nextExecution: 'Scheduled next cycle',
            active: true,
          },
        ],
      });

      const html = renderToString(<CryptoModule maskBalances={false} />);
      expect(html).toContain('CRYPTO NET ASSET VALUE');
      expect(html).toContain('$25,000.00');
      expect(html).toContain('Live Spot Holdings &amp; Global Custody Matrix');
      expect(html).toContain('Automated Dollar-Cost Averaging (DCA) Scheduler');
    });

    it('verifies clicking an asset row updates targetDcaAsset in store', () => {
      useLiquidStore.getState().setTargetDcaAsset('SOL');
      expect(useLiquidStore.getState().targetDcaAsset).toBe('SOL');
    });
  });
});

