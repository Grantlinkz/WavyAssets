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
    it('renders AI funds module with 5-KPI ribbon, risk calibrator, and rationale ledger', () => {
      const html = renderToString(<AiFundsModule />);

      expect(html).toContain('data-testid="ai-funds-module"');
      expect(html).toContain('AI Systematic &amp; Quantitative Strategies');
      expect(html).toContain('Nexus-Quant v6.42');
      expect(html).toContain('Capital Deployed');
      expect(html).toContain('$1,450,000.00');
      expect(html).toContain('2.84');
      expect(html).toContain('3.12');
      expect(html).toContain('-4.20%');

      // Calibrator & Kill switch
      expect(html).toContain('Dynamic Risk Posture &amp; Leverage Calibrator');
      expect(html).toContain('Capital Preservation');
      expect(html).toContain('Balanced Trend');
      expect(html).toContain('High-Volatility Alpha');
      expect(html).toContain('Fiduciary Kill Switch');
      expect(html).toContain('ARMED • T+0');

      // Rationale & GPU
      expect(html).toContain('Execution Rationale &amp; Rebalance Ledger');
      expect(html).toContain('Deribit ETH-PERP');
      expect(html).toContain('Tokenized GPU Cluster');
      expect(html).toContain('160x NVIDIA H100 SXM5 80GB');
      expect(html).toContain('Claim to Vault');
    });

    it('masks confidential figures when maskBalances is true', () => {
      useDashboardStore.setState({ maskBalances: true });
      const html = renderToString(<AiFundsModule maskBalances={true} />);

      expect(html).toContain('data-testid="ai-funds-module"');
      expect(html).toContain('••••••••');
    });

    it('renders state when circuit breaker is triggered', () => {
      useAlternativeStore.setState({ isCircuitBreakerTriggered: true });
      const html = renderToString(<AiFundsModule isCircuitBreakerTriggered={true} />);

      expect(html).toContain('TRADING HALTED');
      expect(html).toContain('POSITIONS FLATTENED TO USDC');
      expect(html).toContain('Re-Arm Algorithmic Engine');
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
      expect(html).toContain('March 2025 (Current)');
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
      expect(html).toContain('1997 Porsche 911 GT2 (993) Clubsport');
      expect(html).toContain('Patek Philippe Grand Complications 5270P');

      // Drive Booking Engine
      expect(html).toContain('Fleet Monetization Yield &amp; Member Drive-Day Engine');
      expect(html).toContain('April 2025 Driving Calendar');
      expect(html).toContain('Reserve Concierge Drive Day');

      // Custody Ledger
      expect(html).toContain('Custody &amp; Underwriting');
      expect(html).toContain('99.4');
      expect(html).toContain('100.0');
      expect(html).toContain('Concours Gold Standard');
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
