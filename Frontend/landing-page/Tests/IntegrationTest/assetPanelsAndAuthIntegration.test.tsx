import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AssetNavRail } from '../../src/components/panels/AssetNavRail';
import { AssetContainer } from '../../src/components/panels/AssetContainer';
import { CryptoPanel } from '../../src/components/panels/views/CryptoPanel';
import { StocksPanel } from '../../src/components/panels/views/StocksPanel';
import { AiFundsPanel } from '../../src/components/panels/views/AiFundsPanel';
import { RealEstatePanel } from '../../src/components/panels/views/RealEstatePanel';
import { CarsPanel } from '../../src/components/panels/views/CarsPanel';
import { VipCardsPanel } from '../../src/components/panels/views/VipCardsPanel';
import { WalletPanel } from '../../src/components/panels/views/WalletPanel';
import { UnifiedAuthModal } from '../../src/components/auth/UnifiedAuthModal';
import App from '../../src/App';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Asset Panels & Unified Auth Modal Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      activeAssetId: 'crypto',
      isMegaMenuOpen: false,
      authModal: {
        isOpen: false,
        step: 1,
        initialTier: 'institutional',
      },
    });
    window.location.hash = '';
  });

  it('renders AssetNavRail with all 7 horizontal asset vertical tabs', () => {
    const html = renderToString(<AssetNavRail />);

    expect(html).toContain('CRYPTO INVESTMENT');
    expect(html).toContain('GLOBAL STOCKS');
    expect(html).toContain('AI SYSTEMATIC FUNDS');
    expect(html).toContain('REAL ESTATE');
    expect(html).toContain('CARS INVENTORY');
    expect(html).toContain('VIP CARDS');
    expect(html).toContain('WALLET &amp; MPC');

  });

  it('renders AssetContainer enforcing locked min-height: 540px to eliminate CLS', () => {
    const html = renderToString(<AssetContainer initialAssetId="crypto" />);

    expect(html).toContain('data-testid="asset-container"');
    expect(html).toContain('data-testid="asset-panel-viewport"');
    expect(html).toContain('min-h-[540px]');
    expect(html).toContain('data-testid="panel-crypto"');
  });

  it('renders all 7 dedicated modular asset class panels with verified metrics', () => {
    // 1. Crypto Panel
    const cryptoHtml = renderToString(<CryptoPanel />);
    expect(cryptoHtml).toContain('Crypto Yield &amp; Smart Automated Rules');
    expect(cryptoHtml).toContain('19.4%');
    expect(cryptoHtml).toContain('Bitcoin Basis Growth Yield Account');
    expect(cryptoHtml).toContain('Ethereum Staking &amp; Security Rewards');

    // 2. Stocks Panel
    const stocksHtml = renderToString(<StocksPanel />);
    expect(stocksHtml).toContain('Global Stocks &amp; Pre-IPO Direct Market Access');
    expect(stocksHtml).toContain('SPACEX');
    expect(stocksHtml).toContain('STRIPE');
    expect(stocksHtml).toContain('ANTHROPIC');

    // 3. AI Funds Panel
    const aiHtml = renderToString(<AiFundsPanel />);
    expect(aiHtml).toContain('AI Systematic Funds &amp; GPU Compute Mesh');
    expect(aiHtml).toContain('NVIDIA H100 SXM5 80GB Cluster');
    expect(aiHtml).toContain('14.8%');

    // 4. Real Estate Panel
    const reHtml = renderToString(<RealEstatePanel />);
    expect(reHtml).toContain('Tokenized Prime Real Estate &amp; SPV Deeds');
    expect(reHtml).toContain('Bahnhofstrasse Trophy Retail');
    expect(reHtml).toContain('Mayfair Fiduciary House');

    // 5. Cars Panel
    const carsHtml = renderToString(<CarsPanel />);
    expect(carsHtml).toContain('Exotic &amp; Historical Vehicle Vault');
    expect(carsHtml).toContain('1964 Ferrari 250 GTO Series II');
    expect(carsHtml).toContain('1995 McLaren F1 LM Specification');
    expect(carsHtml).toContain('$48,500,000');

    // 6. VIP Cards Panel
    const cardsHtml = renderToString(<VipCardsPanel />);
    expect(cardsHtml).toContain('VIP Concierge &amp; Collateral Metal Cards');
    expect(cardsHtml).toContain('WavyAssets Sovereign Obsidian Titanium');
    expect(cardsHtml).toContain('0.00% Zero-FX in 140+ Jurisdictions');

    // 7. Wallet Panel
    const walletHtml = renderToString(<WalletPanel />);
    expect(walletHtml).toContain('Digital Custody &amp; Multi-Sig MPC Enclave');
    expect(walletHtml).toContain('Zurich Military Bunker Enclave');
    expect(walletHtml).toContain('$500M');
    expect(walletHtml).toContain('3-of-5');
  });

  it('renders closed UnifiedAuthModal as empty output when isOpen is false', () => {
    useTerminalStore.setState({ authModal: { isOpen: false, step: 1, initialTier: 'institutional' } });
    const html = renderToString(<UnifiedAuthModal />);
    expect(html).toBe('');
  });

  it('renders open UnifiedAuthModal Step 1 with credentials and tier selection', () => {
    useTerminalStore.setState({
      authModal: { isOpen: true, step: 1, initialTier: 'institutional' },
    });
    const html = renderToString(<UnifiedAuthModal />);

    expect(html).toContain('data-testid="unified-auth-modal"');
    expect(html).toContain('Institutional Terminal Access');
    expect(html).toContain('WavyAssets SECURE GATEWAY // FIPS 140-3 LEVEL 4');
    expect(html).toContain('data-testid="tab-login"');
    expect(html).toContain('data-testid="tab-mandate"');
    expect(html).toContain('data-testid="auth-tier-private"');
    expect(html).toContain('data-testid="auth-tier-institutional"');
    expect(html).toContain('data-testid="auth-email-input"');
    expect(html).toContain('data-testid="auth-password-input"');
    expect(html).toContain('Proceed to 2FA Attestation');
  });

  it('renders open UnifiedAuthModal Step 2 with 6-digit Input-OTP slots and countdown', () => {
    useTerminalStore.setState({
      authModal: { isOpen: true, step: 2, initialTier: 'institutional' },
    });
    const html = renderToString(<UnifiedAuthModal />);

    expect(html).toContain('Hardware 2FA Quorum Attestation');
    expect(html).toContain('6-Digit Security Enclave Code');
    expect(html).toContain('data-testid="auth-otp-input"');
    expect(html).toContain('Verify &amp; Authorize Session');
    expect(html).toContain('Resend OTP');
  });

  it('renders complete App command deck with AssetContainer and UnifiedAuthModal mounted', () => {
    const html = renderToString(<App />);

    expect(html).toContain('data-testid="asset-container"');
    expect(html).toContain('data-testid="asset-panel-viewport"');
  });
});
