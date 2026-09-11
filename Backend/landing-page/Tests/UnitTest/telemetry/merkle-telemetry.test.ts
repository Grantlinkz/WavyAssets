import { describe, it, expect, beforeEach } from 'vitest';
import { TelemetryService } from '../../../src/modules/telemetry/telemetry.service';

describe('Enclave Merkle Telemetry Unit Tests', () => {
  let telemetryService: TelemetryService;

  beforeEach(() => {
    telemetryService = new TelemetryService();
  });

  it('should deterministically calculate binary Merkle root hash for vault reserve leaves', () => {
    const leaves = [
      'VAULT_BTC_RESERVE_1000',
      'VAULT_ETH_RESERVE_50000',
      'VAULT_US_TREASURIES_10000000',
      'VAULT_GOLD_BULLION_500',
    ];

    const root1 = telemetryService.calculateMerkleRoot(leaves);
    const root2 = telemetryService.calculateMerkleRoot(leaves);

    expect(root1).toBe(root2);
    expect(root1).toHaveLength(64); // SHA-256 hex string

    // Tampering test
    const tamperedLeaves = [...leaves];
    tamperedLeaves[0] = 'VAULT_BTC_RESERVE_999';
    const tamperedRoot = telemetryService.calculateMerkleRoot(tamperedLeaves);
    expect(tamperedRoot).not.toBe(root1);
  });

  it('should deliver complete Enclave telemetry with 3 HSM clusters and settlement latency under 20ms', async () => {
    const enclave = await telemetryService.getEnclaveTelemetry();

    expect(enclave.merkleRoot).toHaveLength(64);
    expect(enclave.clearingLatencyMs).toBeLessThanOrEqual(20);
    expect(enclave.enclaveStatus).toBe('OPTIMAL');
    expect(enclave.hsmClusters).toHaveLength(3);

    const locations = enclave.hsmClusters.map((c) => c.location);
    expect(locations).toContain('Geneva (CH-01)');
    expect(locations).toContain('Zurich (CH-02)');
    expect(locations).toContain('New York (US-01)');

    expect(enclave.tierAum.total).toBe('$17,220,000,000');
  });
});
