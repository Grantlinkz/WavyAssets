import { describe, it, expect, beforeEach } from 'vitest';
import { useGovernanceStore } from '../../src/store/useGovernanceStore';
import {
  HARDWARE_SECURITY_KEYS,
  INITIAL_CLIENT_SESSIONS,
  INITIAL_WHITELIST_DESTINATIONS,
} from '../../src/lib/governanceAssetData';

describe('Security Command Center & Time-Lock Enclaves Module Unit Tests (Sprint 5)', () => {
  beforeEach(() => {
    useGovernanceStore.setState({
      sessions: [...INITIAL_CLIENT_SESSIONS],
      destinations: [...INITIAL_WHITELIST_DESTINATIONS],
      isAddDestinationModalOpen: false,
    });
  });

  it('validates 3-token physical hardware security key fleet', () => {
    expect(HARDWARE_SECURITY_KEYS).toHaveLength(3);

    const primaryKey = HARDWARE_SECURITY_KEYS.find((k) => k.isPrimary);
    expect(primaryKey).toBeDefined();
    expect(primaryKey?.name).toContain('YubiKey 5C NFC');
    expect(primaryKey?.badge).toContain('PRIMARY SIGNER');
    expect(primaryKey?.algorithm).toContain('ECDSA P-256');

    const ledger = HARDWARE_SECURITY_KEYS.find((k) => k.name.includes('Ledger'));
    expect(ledger?.badge).toContain('VERIFIED IN VAULT');
    expect(ledger?.serial).toBe('LDG-99381-SEC');

    const appleEnclave = HARDWARE_SECURITY_KEYS.find((k) => k.name.includes('Apple Touch ID'));
    expect(appleEnclave?.badge).toContain('LOCAL RECOVERY KEY');
  });

  it('manages authenticated client sessions and terminates sessions', () => {
    const store = useGovernanceStore.getState();
    expect(store.sessions).toHaveLength(3);

    const currentSession = store.sessions.find((s) => s.isCurrent);
    expect(currentSession).toBeDefined();
    expect(currentSession?.id).toBe('sess-1');
    expect(currentSession?.location).toContain('Zurich');

    // Terminate sess-2 (iPhone)
    store.terminateSession('sess-2');
    expect(useGovernanceStore.getState().sessions).toHaveLength(2);
    expect(useGovernanceStore.getState().sessions.find((s) => s.id === 'sess-2')).toBeUndefined();

    // Revoke all other sessions
    store.revokeAllOtherSessions();
    const remaining = useGovernanceStore.getState().sessions;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].isCurrent).toBe(true);
  });

  it('validates pre-seeded whitelisted destinations and status distribution', () => {
    const store = useGovernanceStore.getState();
    expect(store.destinations).toHaveLength(5);

    const matured = store.destinations.filter((d) => d.status === 'MATURED');
    expect(matured).toHaveLength(3);
    expect(matured.every((d) => !d.isTimeLocked)).toBe(true);

    const quarantined = store.destinations.filter((d) => d.status === 'QUARANTINE');
    expect(quarantined).toHaveLength(2);
    expect(quarantined.every((d) => d.isTimeLocked)).toBe(true);
    expect(quarantined.every((d) => d.quarantineHoursTotal === 48)).toBe(true);
  });

  it('ENFORCES ZERO-TRUST INVARIANT: Newly registered destinations automatically receive 48H Time-Lock Quarantine', () => {
    const store = useGovernanceStore.getState();
    const initialCount = store.destinations.length;

    store.addWhitelistedDestination({
      assetRail: 'Bitcoin',
      assetName: 'BTC Segregated Custody',
      railBadge: 'BTC',
      destinationLabel: 'Global Multi-Sig Cold Safe #09',
      beneficiaryOrg: 'Zurich Vault Co.',
      addressOrIban: 'bc1p9842xyt...5421q8',
    });

    const updated = useGovernanceStore.getState().destinations;
    expect(updated).toHaveLength(initialCount + 1);

    const newlyAdded = updated[0];
    // Critical zero-trust invariants:
    expect(newlyAdded.destinationLabel).toBe('Global Multi-Sig Cold Safe #09');
    expect(newlyAdded.isTimeLocked).toBe(true);
    expect(newlyAdded.quarantineHoursTotal).toBe(48);
    expect(newlyAdded.quarantineHoursRemaining).toBe(48.0);
    expect(newlyAdded.status).toBe('QUARANTINE');
    expect(newlyAdded.remainingDisplay).toContain('48h 00m 00s REMAINING');
    expect(newlyAdded.signersDetails).toBe('1 of 2 Signed');
  });

  it('cancels/deletes pending or matured destinations', () => {
    const store = useGovernanceStore.getState();
    const targetId = 'wl-4'; // Solana in quarantine

    store.cancelDestination(targetId);
    expect(useGovernanceStore.getState().destinations.find((d) => d.id === targetId)).toBeUndefined();
  });

  it('controls add destination modal state', () => {
    const store = useGovernanceStore.getState();
    expect(store.isAddDestinationModalOpen).toBe(false);

    store.openAddDestinationModal();
    expect(useGovernanceStore.getState().isAddDestinationModalOpen).toBe(true);

    store.closeAddDestinationModal();
    expect(useGovernanceStore.getState().isAddDestinationModalOpen).toBe(false);
  });
});
