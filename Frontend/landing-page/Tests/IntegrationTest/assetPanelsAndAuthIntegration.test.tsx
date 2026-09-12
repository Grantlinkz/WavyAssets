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
    expect(cryptoHtml).toContain('data-testid="crypto-video"');
    expect(cryptoHtml).toMatch(/autoplay/i);
    expect(cryptoHtml).toMatch(/loop/i);
    expect(cryptoHtml).toMatch(/playsinline/i);
    expect(cryptoHtml).not.toContain('controls');

    // 2. Stocks Panel
    const stocksHtml = renderToString(<StocksPanel />);
    expect(stocksHtml).toContain('Global Stocks &amp; Pre-IPO Direct Market Access');
    expect(stocksHtml).toContain('SPACEX');
    expect(stocksHtml).toContain('STRIPE');
    expect(stocksHtml).toContain('ANTHROPIC');
    expect(stocksHtml).toContain('data-testid="stocks-video"');
    expect(stocksHtml).toMatch(/autoplay/i);
    expect(stocksHtml).toMatch(/loop/i);
    expect(stocksHtml).toMatch(/playsinline/i);
    expect(stocksHtml).not.toContain('controls');

    // 3. AI Funds Panel
    const aiHtml = renderToString(<AiFundsPanel />);
    expect(aiHtml).toContain('AI Systematic Funds &amp; GPU Compute Mesh');
    expect(aiHtml).toContain('NVIDIA H100 SXM5 80GB Cluster');
    expect(aiHtml).toContain('14.8%');
    expect(aiHtml).toContain('data-testid="ai-funds-robot-video"');
    expect(aiHtml).toMatch(/autoplay/i);
    expect(aiHtml).toMatch(/loop/i);
    expect(aiHtml).toMatch(/playsinline/i);
    expect(aiHtml).not.toContain('controls');

    // 4. Real Estate Panel
    const reHtml = renderToString(<RealEstatePanel />);
    expect(reHtml).toContain('Tokenized Prime Real Estate &amp; SPV Deeds');
    expect(reHtml).toContain('Bahnhofstrasse Trophy Retail');
    expect(reHtml).toContain('Mayfair Fiduciary House');
    expect(reHtml).toContain('data-testid="real-estate-video"');
    expect(reHtml).toMatch(/autoplay/i);
    expect(reHtml).toMatch(/loop/i);
    expect(reHtml).toMatch(/playsinline/i);
    expect(reHtml).not.toContain('controls');

    // 5. Cars Panel
    const carsHtml = renderToString(<CarsPanel />);
    expect(carsHtml).toContain('Exotic &amp; Historical Vehicle Vault');
    expect(carsHtml).toContain('1964 Ferrari 250 GTO Series II');
    expect(carsHtml).toContain('1995 McLaren F1 LM Specification');
    expect(carsHtml).toContain('$48,500,000');
    expect(carsHtml).toContain('data-testid="cars-video"');
    expect(carsHtml).toMatch(/autoplay/i);
    expect(carsHtml).toMatch(/loop/i);
    expect(carsHtml).toMatch(/playsinline/i);
    expect(carsHtml).not.toContain('controls');

    // 6. VIP Cards Panel
    const cardsHtml = renderToString(<VipCardsPanel />);
    expect(cardsHtml).toContain('VIP Concierge &amp; Collateral Metal Cards');
    expect(cardsHtml).toContain('WavyAssets Sovereign Obsidian Titanium');
    expect(cardsHtml).toContain('0.00% Zero-FX in 140+ Jurisdictions');
    expect(cardsHtml).toContain('data-testid="vip-cards-video"');
    expect(cardsHtml).toMatch(/autoplay/i);
    expect(cardsHtml).toMatch(/loop/i);
    expect(cardsHtml).toMatch(/playsinline/i);
    expect(cardsHtml).not.toContain('controls');

    // 7. Wallet Panel
    const walletHtml = renderToString(<WalletPanel />);
    expect(walletHtml).toContain('Digital Custody &amp; Multi-Sig MPC Enclave');
    expect(walletHtml).toContain('Zurich Military Bunker Enclave');
    expect(walletHtml).toContain('$500M');
    expect(walletHtml).toContain('3-of-5');
    expect(walletHtml).toContain('data-testid="wallet-video"');
    expect(walletHtml).toMatch(/autoplay/i);
    expect(walletHtml).toMatch(/loop/i);
    expect(walletHtml).toMatch(/playsinline/i);
    expect(walletHtml).not.toContain('controls');
  });

  it('renders closed UnifiedAuthModal as empty output when isOpen is false', () => {
    useTerminalStore.setState({ authModal: { isOpen: false, step: 1, initialTier: 'institutional' } });
    const html = renderToString(<UnifiedAuthModal />);
    expect(html).toBe('');
  });

  it('renders open UnifiedAuthModal Step 1 with credentials and tier selection', () => {
    useTerminalStore.setState({
      authModal: { isOpen: true, step: 1, initialTier: 'institutional', initialMode: 'login' },
    });
    const html = renderToString(<UnifiedAuthModal />);

    expect(html).toContain('data-testid="unified-auth-modal"');
    expect(html).toContain('Sign In to Your Account');
    expect(html).toContain('WavyAssets SECURE ACCESS');
    expect(html).toContain('data-testid="tab-login"');
    expect(html).toContain('data-testid="tab-mandate"');
    expect(html).toContain('data-testid="auth-tier-private"');
    expect(html).toContain('data-testid="auth-tier-institutional"');
    expect(html).toContain('data-testid="auth-email-input"');
    expect(html).toContain('data-testid="auth-password-input"');
    expect(html).toContain('data-testid="auth-toggle-password-btn"');
    expect(html).toContain('data-testid="auth-forgot-password-btn"');
    expect(html).toContain('Continue to Verification');
  });

  it('renders open UnifiedAuthModal in Forgot Password mode', () => {
    useTerminalStore.setState({
      authModal: { isOpen: true, step: 1, initialTier: 'institutional', initialMode: 'forgot-password' },
    });
    const html = renderToString(<UnifiedAuthModal />);

    expect(html).toContain('Reset Your Password');
    expect(html).toContain('data-testid="auth-forgot-email-input"');
    expect(html).toContain('Send Reset Code');
    expect(html).toContain('Back to Sign In');
  });

  it('renders open UnifiedAuthModal in Request Mandate mode with Full Name field', () => {
    useTerminalStore.setState({
      authModal: { isOpen: true, step: 1, initialTier: 'institutional', initialMode: 'mandate' },
    });
    const html = renderToString(<UnifiedAuthModal />);

    expect(html).toContain('Create Your Account');
    expect(html).toContain('data-testid="auth-fullname-input"');
    expect(html).toContain('Full Name');
    expect(html).toContain('Create Account &amp; Continue');
  });

  it('renders open UnifiedAuthModal Step 2 with 6-digit Input-OTP slots and countdown', () => {
    useTerminalStore.setState({
      authModal: { isOpen: true, step: 2, initialTier: 'institutional' },
    });
    const html = renderToString(<UnifiedAuthModal />);

    expect(html).toContain('Enter Verification Code');
    expect(html).toContain('6-Digit Security Code');
    expect(html).toContain('data-testid="auth-otp-input"');
    expect(html).toContain('Verify &amp; Access Dashboard');
    expect(html).toContain('Resend Code');
  });

  it('renders complete App command deck with AssetContainer and UnifiedAuthModal mounted', () => {
    const html = renderToString(<App />);

    expect(html).toContain('data-testid="asset-container"');
    expect(html).toContain('data-testid="asset-panel-viewport"');
  });
});
