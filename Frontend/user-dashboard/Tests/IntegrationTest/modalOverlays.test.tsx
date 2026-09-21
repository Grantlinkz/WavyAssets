import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DepositModal } from '../../src/components/modals/DepositModal';
import { WithdrawModal } from '../../src/components/modals/WithdrawModal';
import { TradeModal } from '../../src/components/modals/TradeModal';
import { KycDrawer } from '../../src/components/modals/KycDrawer';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';

describe('Institutional Modal Overlays Suite (Node 24 / SSR Parity)', () => {
  beforeEach(() => {
    usePortfolioStore.getState().resetToDefaults();
  });

  describe('DepositModal', () => {
    it('does not render markup when isOpen is false', () => {
      const html = renderToString(<DepositModal isOpen={false} />);
      expect(html).toBe('');
    });

    it('renders Bank Wire rail details when isOpen is true and activeTab is wire', () => {
      const html = renderToString(<DepositModal isOpen={true} activeTab="wire" />);

      expect(html).toContain('data-testid="deposit-modal"');
      expect(html).toContain('DEPOSIT');
      expect(html).toContain('TIER 3 PERPETUAL CLEARANCE');
      expect(html).toContain('data-testid="deposit-view-wire"');
      expect(html).toContain('Grant Global Holdings AG / Escrow Treuhand Zurich');
      expect(html).toContain('CH93 0023 8812 4019 8821 0');
      expect(html).toContain('UBSWCHZH80A');
      expect(html).toContain('WY-9942-TREASURY-03');
    });

    it('renders Crypto / Web3 rail details when activeTab is crypto', () => {
      const html = renderToString(<DepositModal isOpen={true} activeTab="crypto" />);

      expect(html).toContain('data-testid="deposit-view-crypto"');
      expect(html).toContain('0x94A8D19F200c9261a81eC97669d0339dE78E916B');
      expect(html).toContain('Geneva Enclave Cold Vault');
    });

    it('renders Obsidian VIP Card rail details when activeTab is card', () => {
      const html = renderToString(<DepositModal isOpen={true} activeTab="card" />);

      expect(html).toContain('data-testid="deposit-view-card"');
      expect(html).toContain('Tier 3 Black Card');
      expect(html).toContain('LOCKED');
    });

    it('closes modal correctly through store action', () => {
      usePortfolioStore.getState().openModal('deposit');
      expect(usePortfolioStore.getState().activeModal).toBe('deposit');

      usePortfolioStore.getState().closeModal();
      expect(usePortfolioStore.getState().activeModal).toBeNull();
    });
  });

  describe('WithdrawModal', () => {
    it('does not render markup when isOpen is false', () => {
      const html = renderToString(<WithdrawModal isOpen={false} />);
      expect(html).toBe('');
    });

    it('renders 24-48h whitelist alert and FIDO2 WebAuthn authorization trigger', () => {
      const html = renderToString(<WithdrawModal isOpen={true} />);

      expect(html).toContain('data-testid="withdraw-modal"');
      expect(html).toContain('WITHDRAW');
      expect(html).toContain('24-48H WHITELIST ENFORCED');
      expect(html).toContain('Zero-Trust Whitelist Lock Active');
      expect(html).toContain('Bank Withdrawal');
      expect(html).not.toContain('Pre-Approved Whitelist Destination');
      expect(html).toContain('Authorize with YubiKey / WebAuthn');
    });
  });

  describe('TradeModal', () => {
    it('does not render markup when isOpen is false', () => {
      const html = renderToString(<TradeModal isOpen={false} />);
      expect(html).toBe('');
    });

    it('renders OTC swap engine with live rates, execution route, and instant swap trigger', () => {
      const html = renderToString(<TradeModal isOpen={true} />);

      expect(html).toContain('data-testid="trade-modal"');
      expect(html).toContain('TRADE');
      expect(html).toContain('INSTANT');
      expect(html).toContain('YOU ALLOCATE / PAY');
      expect(html).toContain('YOU ACQUIRE / RECEIVE (ESTIMATED)');
      expect(html).toContain('Institutional OTC Dark Pool');
      expect(html).toContain('Execute Instant Global Swap');
    });
  });

  describe('KycDrawer', () => {
    it('does not render markup when isOpen is false', () => {
      const html = renderToString(<KycDrawer isOpen={false} />);
      expect(html).toBe('');
    });

    it('renders Tier 3 Perpetual Clearance with unlimited limits and verified documents', () => {
      const html = renderToString(<KycDrawer isOpen={true} />);

      expect(html).toContain('data-testid="kyc-modal"');
      expect(html).toContain('COMPLIANCE');
      expect(html).toContain('ACCREDITED INSTITUTIONAL');
      expect(html).toContain('FINMA &amp; VARA DUAL-CLEARED');
      expect(html).toContain('UNLIMITED');
      expect(html).toContain('Grant Global Holdings AG Charter');
      expect(html).toContain('Source of Wealth Notarization');
      expect(html).toContain('CHAINLINK CCIP #99214-CH');
    });
  });
});
