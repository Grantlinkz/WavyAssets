import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AiFundsModule } from '../../src/components/modules/ai-funds/AiFundsModule';
import { RealEstateModule } from '../../src/components/modules/real-estate/RealEstateModule';
import { CarsModule } from '../../src/components/modules/cars/CarsModule';
import { App } from '../../src/App';
import { useDashboardStore } from '../../src/store/useDashboardStore';
import { useAlternativeStore } from '../../src/store/useAlternativeStore';
import {
  INITIAL_OTC_ORDERS,
  INITIAL_DRIVE_SLOTS,
  GPU_CLUSTER_TELEMETRY,
} from '../../src/lib/alternativeAssetData';

describe('Alternative Asset Modules Integration Suite (Sprint 4)', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      theme: 'dark',
      activeVertical: 'ai-funds',
      maskBalances: false,
    });
    useAlternativeStore.setState({
      selectedRiskTier: 'balanced',
      isCircuitBreakerTriggered: false,
      activeRationaleFilter: 'All Events',
      claimedGpuYieldUsdc: 0,
      pendingGpuYieldUsdc: GPU_CLUSTER_TELEMETRY.pendingYieldUsdc,
      selectedRegionFilter: 'ALL REGIONS',
      otcOrders: [...INITIAL_OTC_ORDERS],
      activeOtcTab: 'ALL',
      lastExecutedOrderId: null,
      userRealEstateHoldings: {
        're-1': { tokens: 2400, totalInvested: 1200000, leases: [] },
        're-2': { tokens: 1500, totalInvested: 750000, leases: [] },
        're-3': { tokens: 1100, totalInvested: 550000, leases: [] },
        're-4': { tokens: 700, totalInvested: 350000, leases: [] },
      },
      userVehicleHoldings: {
        'car-1': { owned: true, purchaseType: 'full', totalInvested: 580000, leases: [] },
        'watch-1': { owned: true, purchaseType: 'full', totalInvested: 270000, leases: [] },
      },
      driveSlots: [...INITIAL_DRIVE_SLOTS],
      selectedLocation: 'Monaco GP Circuit',
      remainingDriveSessions: 2,
      lastReservedDay: null,
    });
  });

  describe('AI Systematic & Quantitative Funds SSR Rendering', () => {
    it('renders AI funds module with 4-KPI ribbon, asset inventory, and distribution blotter', () => {
      const html = renderToString(<AiFundsModule />);

      expect(html).toContain('data-testid="ai-funds-module"');
      expect(html).toContain('AI Systematic &amp; Quantitative Strategies');
      expect(html).toContain('TOTAL AI COMPUTE EQUITY');
      expect(html).toContain('NET STRATEGY YIELD');
      expect(html).toContain('AVERAGE COMPUTE APY');
      expect(html).toContain('CLUSTER UTILIZATION');
      expect(html).toContain('Institutional Asset Inventory');
      expect(html).toContain('Monthly Compute &amp; Arbitrage Distribution Tracker');
      expect(html).toContain('Secondary OTC Compute Bulletin');
    });

    it('masks confidential figures when maskBalances is true', () => {
      useDashboardStore.setState({ maskBalances: true });
      const html = renderToString(<AiFundsModule maskBalances={true} />);

      expect(html).toContain('data-testid="ai-funds-module"');
      expect(html).toContain('••••••••');
    });
  });

  describe('Tokenized Real Estate SSR Rendering', () => {
    it('renders Real Estate module with SPV deck, rental blotter, and secondary OTC bulletin', () => {
      const html = renderToString(<RealEstateModule />);

      expect(html).toContain('data-testid="real-estate-module"');
      expect(html).toContain('Tokenized Real Estate &amp; Infrastructure');
      expect(html).toContain('TOTAL PROPERTY EQUITY');
      expect(html).toContain('$2,850,000.00');
      expect(html).toContain('AVERAGE NET CAP RATE');
      expect(html).toContain('7.07%');

      // SPV Properties
      expect(html).toContain('One Zurich Financial Center');
      expect(html).toContain('London Mayfair Luxury Mews');
      expect(html).toContain('Geneva Lakeside Diplomatic Villa');
      expect(html).toContain('Frankfurt Hyperscale Data Hub');

      // Rental Distribution Blotter
      expect(html).toContain('Monthly Rental Distribution Tracker');
      expect(html).toContain('(Current)');
      expect(html).toContain('CLEARED');

      // Tenant Credit Matrix & OTC Bulletin
      expect(html).toContain('Tenant Credit Health &amp; Solvency Index');
      expect(html).toContain('Treuhand Zürich AG');
      expect(html).toContain('Secondary OTC Bulletin');
      expect(html).toContain('EXECUTE BUY');
      expect(html).toContain('FILL BID');
    });

    it('masks property equity and rental yields when maskBalances is true', () => {
      useDashboardStore.setState({ maskBalances: true });
      const html = renderToString(<RealEstateModule maskBalances={true} />);

      expect(html).toContain('data-testid="real-estate-module"');
      expect(html).toContain('••••••••');
    });
  });

  describe('Exotic Vehicles & Horology Vault SSR Rendering', () => {
    it('renders Cars module with vehicle cards, drive booking engine, and custody ledger', () => {
      const html = renderToString(<CarsModule />);

      expect(html).toContain('data-testid="cars-module"');
      expect(html).toContain('Exotic Vehicles &amp; Horology Vault');
      expect(html).toContain('GENEVA FREEPORT &amp; ZURICH HOROLOGY VAULT');
      expect(html).toContain('VAULTED VALUATION');
      expect(html).toContain('$850,000.00');
      expect(html).toContain('ACTIVE INSURED LIMIT');
      expect(html).toContain('$1,200,000.00');

      // Curated Assets
      expect(html).toContain('2023 Porsche 911 GT3 RS (992)');
      expect(html).toContain('2022 Patek Philippe Grand Complications 5270P');

      // Drive Booking Engine
      expect(html).toContain('Fleet Monetization Yield &amp; Member Drive-Day Engine');
      expect(html).toContain('Driving Calendar');
      expect(html).toContain('Reserve Concierge Drive Day');

      // Custody Ledger
      expect(html).toContain('Custody &amp; Underwriting');
      expect(html).toContain('99.9');
      expect(html).toContain('100.0');
      expect(html).toContain('Factory Delivery Mileage');
    });

    it('masks exotic asset valuations when maskBalances is true', () => {
      useDashboardStore.setState({ maskBalances: true });
      const html = renderToString(<CarsModule maskBalances={true} />);

      expect(html).toContain('data-testid="cars-module"');
      expect(html).toContain('••••••••');
    });
  });

  describe('Dynamic Vertical Workspace App Swapping', () => {
    it('swaps between ai-funds, real-estate, and cars modules in App shell', () => {
      const aiHtml = renderToString(<App activeVertical="ai-funds" />);
      expect(aiHtml).toContain('data-testid="ai-funds-module"');

      const reHtml = renderToString(<App activeVertical="real-estate" />);
      expect(reHtml).toContain('data-testid="real-estate-module"');

      const carsHtml = renderToString(<App activeVertical="cars" />);
      expect(carsHtml).toContain('data-testid="cars-module"');
    });
  });
});
