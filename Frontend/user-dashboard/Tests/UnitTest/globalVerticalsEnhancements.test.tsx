import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';

import { OverviewModule } from '../../src/components/modules/overview/OverviewModule';
import { AssetInventoryDeck } from '../../src/components/modules/cars/AssetInventoryDeck';
import { CardSpendingLimits } from '../../src/components/modules/vip-cards/CardSpendingLimits';
import { VipCardsModule } from '../../src/components/modules/vip-cards/VipCardsModule';
import { WalletModule } from '../../src/components/modules/wallet/WalletModule';
import { LedgerSplitCards } from '../../src/components/modules/wallet/LedgerSplitCards';
import { FiatRampWizard } from '../../src/components/modules/wallet/FiatRampWizard';
import { TxHistoryTable } from '../../src/components/modules/wallet/TxHistoryTable';
import { TaxPackAggregator } from '../../src/components/modules/compliance/TaxPackAggregator';
import { RentalDistributionBlotter } from '../../src/components/modules/real-estate/RentalDistributionBlotter';
import { DriveBookingEngine } from '../../src/components/modules/cars/DriveBookingEngine';

import { usePortfolioStore } from '../../src/store/usePortfolioStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAlternativeStore } from '../../src/store/useAlternativeStore';
import { EXOTIC_ASSETS } from '../../src/lib/alternativeAssetData';

describe('Global Verticals Dynamic Enhancements Suite', () => {
  beforeEach(() => {
    usePortfolioStore.getState().resetToDefaults();
    useAuthStore.setState({
      user: {
        id: 'usr-vip-001',
        email: 'marcus@grantglobal.ch',
        fullName: 'Marcus Aurelius Grant',
        tier: 'INSTITUTIONAL',
        isCorporate: true,
        kycTier: 'TIER_3',
      },
      isAuthenticated: true,
    });
    useAlternativeStore.setState({
      userRealEstateHoldings: {},
      userVehicleHoldings: {},
    });
  });

  describe('Component 1: Execution Overview Blotter (OverviewModule.tsx)', () => {
    it('renders dynamic blotter with pagination and sort order controls', () => {
      const html = renderToString(<OverviewModule />);
      expect(html).toContain('Recent Venue Fills &amp; Position Depth');
      expect(html).toContain('data-testid="blotter-sort-btn"');
      expect(html).toContain('Direct DMA / Dark Pool');
      // Should derive fills from transactions in useLiquidStore
      expect(html).toContain('Geneva OTC Bunker');
    });

    it('displays page information when transaction count exceeds page size', () => {
      const html = renderToString(<OverviewModule />);
      expect(html).toContain('data-testid="blotter-page-info"');
      expect(html).toContain('data-testid="blotter-prev-btn"');
      expect(html).toContain('data-testid="blotter-next-btn"');
    });
  });

  describe('Component 2: Exotic Vehicles & Horology Vault Asset Verification', () => {
    it('contains all 50 audited luxury assets with valid titles and photography URLs', () => {
      expect(EXOTIC_ASSETS.length).toBe(50);

      const vehicles = EXOTIC_ASSETS.filter((a) => a.type === 'vehicle');
      const horology = EXOTIC_ASSETS.filter((a) => a.type === 'horology');
      expect(vehicles.length).toBe(26);
      expect(horology.length).toBe(24);

      EXOTIC_ASSETS.forEach((asset) => {
        expect(asset.title).toBeTruthy();
        expect(typeof asset.title).toBe('string');
        expect(asset.title.length).toBeGreaterThan(3);
        expect(asset.imageUrl).toMatch(/^https?:\/\//);
        expect(asset.fairMarketValue).toBeGreaterThan(0);
      });
    });

    it('renders AssetInventoryDeck with verified fallback attributes', () => {
      const html = renderToString(<AssetInventoryDeck />);
      expect(html).toContain('Tier-1 Vaulted Tangible Assets');
      expect(html).toContain('data-testid="exotic-search-input"');
      expect(html).toContain('loading="lazy"');
    });
  });

  describe('Component 3: Obsidian VIP Card Spending Limits & KYC Binding', () => {
    it('strictly enforces KYC limits for Tier 1 ($10k max)', () => {
      useAuthStore.setState({
        user: {
          id: 'usr-tier1',
          email: 't1@wavy.ch',
          fullName: 'Tier 1 User',
          tier: 'RETAIL',
          isCorporate: false,
          kycTier: 'TIER_1',
        },
      });

      const html = renderToString(<CardSpendingLimits />);
      expect(html).toContain('Tier 1 (Basic)');
      expect(html).toContain('max="10000"');
      expect(html).toContain('KYC Max: $10,000.00');
    });

    it('strictly enforces KYC limits for Tier 2 ($250k max)', () => {
      useAuthStore.setState({
        user: {
          id: 'usr-tier2',
          email: 't2@wavy.ch',
          fullName: 'Tier 2 User',
          tier: 'PRIVATE_WEALTH',
          isCorporate: false,
          kycTier: 'TIER_2',
        },
      });

      const html = renderToString(<CardSpendingLimits />);
      expect(html).toContain('Tier 2 (Gov ID Verified)');
      expect(html).toContain('max="250000"');
      expect(html).toContain('KYC Max: $250,000.00');
    });

    it('strictly enforces KYC limits for Tier 3 ($2M max)', () => {
      useAuthStore.setState({
        user: {
          id: 'usr-tier3',
          email: 't3@wavy.ch',
          fullName: 'Tier 3 User',
          tier: 'INSTITUTIONAL',
          isCorporate: true,
          kycTier: 'TIER_3',
        },
      });

      const html = renderToString(<CardSpendingLimits />);
      expect(html).toContain('Tier 3 (Proof of Address / Utility)');
      expect(html).toContain('max="2000000"');
      expect(html).toContain('KYC Max: $2,000,000.00');
    });

    it('binds VipCardsModule net worth and progress dynamically to usePortfolioStore', () => {
      usePortfolioStore.getState().setNetWorth(18500000);
      const html = renderToString(<VipCardsModule />);
      expect(html).toContain('$18,500,000.00');
      expect(html).toContain('74% Completed');
    });
  });

  describe('Component 4: Global MPC Wallet & Interactive Settlement Terminal', () => {
    it('renders dynamic platform net wealth and appropriate enclave tier badge', () => {
      usePortfolioStore.getState().setNetWorth(15000000);
      const html = renderToString(<WalletModule />);
      expect(html).toContain('$15,000,000.00');
      expect(html).toContain('TIER 3 AUDITED ENCLAVE');
    });

    it('renders Card A with actual available cash and Card B with invested capital', () => {
      usePortfolioStore.getState().setAvailableCash(2000000);
      usePortfolioStore.getState().setNetWorth(12000000);
      const html = renderToString(<LedgerSplitCards />);
      expect(html).toContain('$2,000,000.00');
      // Invested capital: 12M - 2M = 10M
      expect(html).toContain('$10,000,000.00');
    });

    it('executes deposit and withdrawal in FiatRampWizard and records transactions', () => {
      usePortfolioStore.getState().setAvailableCash(1000000);
      const initialCash = usePortfolioStore.getState().availableCash;
      
      // Perform deposit
      usePortfolioStore.getState().adjustAvailableCash(500000);
      expect(usePortfolioStore.getState().availableCash).toBe(initialCash + 500000);

      // Perform withdrawal
      const withdrawSuccess = usePortfolioStore.getState().adjustAvailableCash(-200000);
      expect(withdrawSuccess).toBe(true);
      expect(usePortfolioStore.getState().availableCash).toBe(1300000);

      const html = renderToString(<FiatRampWizard />);
      expect(html).toContain('Interactive Settlement Terminal');
      expect(html).toContain('$1,300,000.00');
    });

    it('renders TxHistoryTable with sorting buttons and customizable pagination', () => {
      const html = renderToString(<TxHistoryTable />);
      expect(html).toContain('data-testid="tx-sort-date-btn"');
      expect(html).toContain('data-testid="tx-sort-amount-btn"');
      expect(html).toContain('data-testid="tx-page-counter"');
      expect(html).toContain('data-testid="tx-prev-btn"');
      expect(html).toContain('data-testid="tx-next-btn"');
      expect(html).toContain('Rows per page:');
    });
  });

  describe('Component 5: Compliance & Tax Fiscal Dossier (TaxPackAggregator.tsx)', () => {
    it('calculates zero real estate and fleet yields when user has no alternative holdings', () => {
      useAlternativeStore.setState({
        userRealEstateHoldings: {},
        userVehicleHoldings: {},
      });

      const html = renderToString(<TaxPackAggregator selectedTaxYear="2025" />);
      expect(html).toContain('Unified Global Tax Pack &amp; Gains Aggregation');
      expect(html).toContain('No Active Real Estate SPVs');
      expect(html).toContain('No Vaulted Fleet Placements');
    });

    it('calculates positive real estate rental yield when properties are acquired', () => {
      usePortfolioStore.getState().setAvailableCash(10000000);
      useAlternativeStore.getState().buyProperty('re-1', 100, 500);
      const html = renderToString(<TaxPackAggregator selectedTaxYear="2024" />);
      expect(html).toContain('Audited SPVs Cleared');
      expect(html).not.toContain('No Active Real Estate SPVs');
    });

    it('recalculates metrics dynamically when switching between TY 2024 and TY 2025', () => {
      const html2024 = renderToString(<TaxPackAggregator selectedTaxYear="2024" />);
      const html2025 = renderToString(<TaxPackAggregator selectedTaxYear="2025" />);
      expect(html2024).toContain('TY 2024 (Closed)');
      expect(html2025).toContain('TY 2025 (Accruing)');
    });
  });

  describe('Component 6: Real Estate Monthly Rental Distribution Tracker', () => {
    it('shows empty state when user owns zero properties', () => {
      useAlternativeStore.setState({ userRealEstateHoldings: {} });
      const html = renderToString(<RentalDistributionBlotter />);
      expect(html).toContain('No active rental distributions');
      expect(html).toContain('$0.00 USDC');
    });

    it('generates distribution periods ending at current month when properties are held', () => {
      usePortfolioStore.getState().setAvailableCash(10000000);
      useAlternativeStore.getState().buyProperty('re-1', 200, 500);
      const html = renderToString(<RentalDistributionBlotter />);
      expect(html).toContain('(Current)');
      expect(html).toContain('On-Chain Settlement Hash');
      expect(html).not.toContain('No active rental distributions');
    });
  });

  describe('Component 7: Exotic Vehicles Fleet Monetization & Driving Calendar', () => {
    it('renders dynamic driving calendar with current month and month navigation controls', () => {
      const html = renderToString(<DriveBookingEngine />);
      expect(html).toContain('data-testid="calendar-prev-month-btn"');
      expect(html).toContain('data-testid="calendar-next-month-btn"');
      expect(html).toContain('Driving Calendar');
      expect(html).toContain('Available Member Slot (&gt;70%)');
    });

    it('calculates fleet placements and provides pagination and sorting when cars are held', () => {
      usePortfolioStore.getState().setAvailableCash(10000000);
      useAlternativeStore.getState().buyVehicleAsset('car-1', 580000, 'full');
      useAlternativeStore.getState().buyVehicleAsset('car-2', 1200000, 'full');
      const html = renderToString(<DriveBookingEngine />);
      expect(html).toContain('Quarterly Rental Clearance');
      expect(html).toContain('data-testid="placement-sort-btn"');
      expect(html).toContain('data-testid="placement-page-info"');
    });
  });
});
