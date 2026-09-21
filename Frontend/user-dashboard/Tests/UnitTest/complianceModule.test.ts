import { describe, it, expect, beforeEach } from 'vitest';
import { useGovernanceStore } from '../../src/store/useGovernanceStore';
import {
  KYC_TIERS,
  CORPORATE_ENTITY_PROFILE,
  BENEFICIAL_SIGNERS,
  VERIFIED_CREDENTIALS,
  MULTI_ASSET_TAX_DOSSIER,
  REGULATORY_CORRIDORS,
} from '../../src/lib/governanceAssetData';

describe('Tiered Compliance & Tax Alpha Module Unit Tests (Sprint 5)', () => {
  beforeEach(() => {
    useGovernanceStore.setState({
      selectedTaxYear: '2024',
      isUploadDossierModalOpen: false,
      uploadedDossierFiles: [],
    });
  });

  it('validates 3-tier Global KYC framework hierarchy', () => {
    expect(KYC_TIERS).toHaveLength(3);

    const tier1 = KYC_TIERS.find((t) => t.level === 1);
    expect(tier1?.name).toBe('Standard Individual');
    expect(tier1?.status).toBe('COMPLETED');
    expect(tier1?.dailyLiquidityCap).toBe('$10,000 USD');

    const tier2 = KYC_TIERS.find((t) => t.level === 2);
    expect(tier2?.name).toBe('Enhanced Private Wealth');
    expect(tier2?.status).toBe('COMPLETED');
    expect(tier2?.dailyLiquidityCap).toBe('$250,000 USD');

    const tier3 = KYC_TIERS.find((t) => t.level === 3);
    expect(tier3?.name).toContain('Accredited Institution');
    expect(tier3?.status).toBe('ACTIVE_TIER');
    expect(tier3?.dailyLiquidityCap).toContain('UNLIMITED');
    expect(tier3?.auditStamp).toContain('FINMA');
  });

  it('verifies corporate UBO entity profile and 2-of-3 HSM signer structure', () => {
    expect(CORPORATE_ENTITY_PROFILE.legalName).toBe('Grant Global Holdings AG');
    expect(CORPORATE_ENTITY_PROFILE.uidJurisdiction).toBe('CHE-382.910.442');
    expect(CORPORATE_ENTITY_PROFILE.canton).toContain('Zürich');
    expect(CORPORATE_ENTITY_PROFILE.quorum).toBe('2 of 3 Required Keys');
    expect(CORPORATE_ENTITY_PROFILE.riskClass).toContain('Tier-1 Prime');

    expect(BENEFICIAL_SIGNERS).toHaveLength(3);

    const primaryUbo = BENEFICIAL_SIGNERS.find((s) => s.ownershipPct === 100);
    expect(primaryUbo).toBeDefined();
    expect(primaryUbo?.name).toBe('Marcus Aurelius Grant');
    expect(primaryUbo?.isArmed).toBe(true);
    expect(primaryUbo?.keyIndex).toContain('Key 1 of 3');

    const trusteeSigner = BENEFICIAL_SIGNERS.find((s) => s.role.includes('Fiduciary Trustee'));
    expect(trusteeSigner?.isArmed).toBe(true);
    expect(trusteeSigner?.keyIndex).toContain('Key 2 of 3');

    const coldArbiter = BENEFICIAL_SIGNERS.find((s) => s.role.includes('Supervisory Custodian'));
    expect(coldArbiter?.isArmed).toBe(false);
    expect(coldArbiter?.keyIndex).toContain('Key 3 of 3');
  });

  it('validates verified credentials ledger and notarizations', () => {
    expect(VERIFIED_CREDENTIALS.length).toBeGreaterThanOrEqual(4);
    const verified = VERIFIED_CREDENTIALS.every(
      (c) => c.status === 'VERIFIED' || c.status === '100% CLEAN'
    );
    expect(verified).toBe(true);

    const passport = VERIFIED_CREDENTIALS.find((c) => c.title.includes('Passport'));
    expect(passport?.authority).toContain('Geneva Notary Public');

    const taxResidency = VERIFIED_CREDENTIALS.find((c) => c.title.includes('Tax Residency'));
    expect(taxResidency?.authority).toContain('Canton Zurich');
  });

  it('aggregates multi-asset fiscal dossier and toggles between tax years', () => {
    const store = useGovernanceStore.getState();
    expect(store.selectedTaxYear).toBe('2024');

    const data2024 = MULTI_ASSET_TAX_DOSSIER['2024'];
    expect(data2024).toHaveLength(5);

    const total2024 = data2024.reduce((sum, item) => sum + item.amountUsd, 0);
    expect(total2024).toBe(952570); // $384,120 + $62,450 + $205,200 + $266,800 + $34,000

    // Switch to 2025
    store.setTaxYear('2025');
    expect(useGovernanceStore.getState().selectedTaxYear).toBe('2025');

    const data2025 = MULTI_ASSET_TAX_DOSSIER['2025'];
    expect(data2025).toHaveLength(5);
    const total2025 = data2025.reduce((sum, item) => sum + item.amountUsd, 0);
    expect(total2025).toBe(349400);
  });

  it('validates 4 Global regulatory corridors (CH, US, UK, SG)', () => {
    expect(REGULATORY_CORRIDORS).toHaveLength(4);

    const corridors = REGULATORY_CORRIDORS.map((c) => c.countryCode);
    expect(corridors).toEqual(['CH', 'US', 'UK', 'SG']);

    const switzerland = REGULATORY_CORRIDORS.find((c) => c.countryCode === 'CH');
    expect(switzerland?.framework).toContain('FINMA / AMLA Art. 9');

    const singapore = REGULATORY_CORRIDORS.find((c) => c.countryCode === 'SG');
    expect(singapore?.settlementChannel).toContain('MEPS+');
  });

  it('simulates supporting audit document uploads', () => {
    const store = useGovernanceStore.getState();
    expect(store.uploadedDossierFiles).toHaveLength(0);

    store.simulateUploadDossier('ESTV_Form_102_Dividends_Signed.pdf');
    expect(useGovernanceStore.getState().uploadedDossierFiles).toContain(
      'ESTV_Form_102_Dividends_Signed.pdf'
    );
  });
});
