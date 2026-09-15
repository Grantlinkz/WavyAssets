import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { VipCardsModule } from '../../src/components/modules/vip-cards/VipCardsModule';
import { ComplianceModule } from '../../src/components/modules/compliance/ComplianceModule';
import { SecurityModule } from '../../src/components/modules/security/SecurityModule';
import { App } from '../../src/App';
import { useDashboardStore } from '../../src/store/useDashboardStore';
import { useGovernanceStore } from '../../src/store/useGovernanceStore';
import {
  INITIAL_CLIENT_SESSIONS,
  INITIAL_WHITELIST_DESTINATIONS,
} from '../../src/lib/governanceAssetData';

describe('Governance & Sovereign Modules Integration Suite (Sprint 5)', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      theme: 'dark',
      activeVertical: 'vip-cards',
      maskBalances: false,
    });
    useGovernanceStore.setState({
      isCardFrozen: false,
      cardMode: 'physical',
      isCvvRevealed: false,
      cvvCountdown: 60,
      isBiometricModalOpen: false,
      isConciergeModalOpen: false,
      selectedTaxYear: '2024',
      isUploadDossierModalOpen: false,
      uploadedDossierFiles: [],
      sessions: [...INITIAL_CLIENT_SESSIONS],
      destinations: [...INITIAL_WHITELIST_DESTINATIONS],
      isAddDestinationModalOpen: false,
    });
  });

  describe('VIP Metal Cards & Sovereign Concierge SSR Rendering', () => {
    it('renders VIP cards module with tungsten card, spending limits, and tier progression', () => {
      const html = renderToString(<VipCardsModule />);

      expect(html).toContain('data-testid="vip-cards-module"');
      expect(html).toContain('Obsidian Metal Card &amp; Sovereign Concierge');
      expect(html).toContain('Obsidian Elite Tier (42g Tungsten)');
      expect(html).toContain('data-testid="obsidian-metal-card-panel"');
      expect(html).toContain('42g SOLID TUNGSTEN');
      expect(html).toContain('data-testid="card-spending-limits-panel"');
      expect(html).toContain('$500,000');
      expect(html).toContain('Biometric CVV &amp; PIN Reveal');
      expect(html).toContain('Launch Concierge Desk');
    });

    it('enforces privacy masking on VIP module balances', () => {
      const maskedHtml = renderToString(<VipCardsModule maskBalances={true} />);
      expect(maskedHtml).toContain('••••••');

      const unmaskedHtml = renderToString(<VipCardsModule maskBalances={false} />);
      expect(unmaskedHtml).toContain('$14,820,450.00');
    });
  });

  describe('Tiered Compliance & Tax Alpha SSR Rendering', () => {
    it('renders compliance module with 3-tier KYC checklist, corporate UBO registry, and tax dossier', () => {
      const html = renderToString(<ComplianceModule />);

      expect(html).toContain('data-testid="compliance-module"');
      expect(html).toContain('Tier 01 Baseline');
      expect(html).toContain('Tier 02 Qualified');
      expect(html).toContain('Tier 03 Active');
      expect(html).toContain('Grant Sovereign Holdings AG');
      expect(html).toContain('CHE-382.910.442');
      expect(html).toContain('Marcus Aurelius Grant');
      expect(html).toContain('100%');
      expect(html).toContain('2 of 3 Required Keys');
      expect(html).toContain('Swiss FINMA Regulated Enclave');
      expect(html).toContain('Download AML Pack (PDF)');
    });

    it('renders multi-asset tax dossier and verifies tax year selector', () => {
      useGovernanceStore.getState().setTaxYear('2024');
      const html2024 = renderToString(<ComplianceModule maskBalances={false} selectedTaxYear="2024" />);
      expect(html2024).toContain('Crypto &amp; Equities Gains');
      expect(html2024).toContain('$384,120.00');
      expect(html2024).toContain('Form 8949 CSV');

      const html2025 = renderToString(<ComplianceModule maskBalances={false} selectedTaxYear="2025" />);
      expect(html2025).toContain('$142,850.00');
      expect(html2025).toContain('Accruing MTD');
    });

    it('masks financial figures in tax pack when maskBalances is active', () => {
      const htmlMasked = renderToString(<ComplianceModule maskBalances={true} />);
      expect(htmlMasked).toContain('••••••');
    });
  });

  describe('Security Command Center & Time-Lock Enclaves SSR Rendering', () => {
    it('renders security module with 100/100 defense index, hardware key tokens, and active sessions', () => {
      const html = renderToString(<SecurityModule />);

      expect(html).toContain('data-testid="security-module"');
      expect(html).toContain('MAXIMUM');
      expect(html).toContain('100 / 100 Defense Index');
      expect(html).toContain('Argon2id + FIDO2');
      expect(html).toContain('48H COLD LOCK');
      expect(html).toContain('Primary YubiKey 5C NFC');
      expect(html).toContain('CURRENT SESSION');
      expect(html).toContain('Zurich, Switzerland');
      expect(html).toContain('Emergency Lockdown');
    });

    it('renders whitelisted withdrawal destinations with time-lock quarantine counters', () => {
      const html = renderToString(<SecurityModule />);

      expect(html).toContain('Mandatory Withdrawal Address Whitelist &amp; Time-Lock Matrix');
      expect(html).toContain('Cold Storage SPV Vault');
      expect(html).toContain('MATURED &amp; ACTIVE');
      expect(html).toContain('QUARANTINE');
      expect(html).toContain('REMAINING');
      expect(html).toContain('Add New Destination');
    });
  });

  describe('Master App Shell Navigation for Sprint 5 Verticals', () => {
    it('mounts VipCardsModule when activeVertical is vip-cards', () => {
      const html = renderToString(<App activeVertical="vip-cards" />);
      expect(html).toContain('data-testid="vip-cards-module"');
      expect(html).not.toContain('data-testid="vertical-placeholder"');
    });

    it('mounts ComplianceModule when activeVertical is compliance', () => {
      const html = renderToString(<App activeVertical="compliance" />);
      expect(html).toContain('data-testid="compliance-module"');
      expect(html).not.toContain('data-testid="vertical-placeholder"');
    });

    it('mounts SecurityModule when activeVertical is security', () => {
      const html = renderToString(<App activeVertical="security" />);
      expect(html).toContain('data-testid="security-module"');
      expect(html).not.toContain('data-testid="vertical-placeholder"');
    });
  });
});
