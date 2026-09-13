import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplianceService } from '../../../src/modules/compliance/compliance.service';
import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { CryptoService } from '../../../src/common/utils/crypto.service';

describe('ComplianceService Unit Tests', () => {
  let complianceService: ComplianceService;
  let mockPrisma: any;
  let mockCrypto: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: vi.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'audit-entry-uuid-999',
            ...args.data,
            createdAt: new Date(),
          }),
        ),
      },
    };

    mockCrypto = {
      hashIpAddress: vi.fn().mockReturnValue('mockiphash_a8723b49e29f'),
    };

    complianceService = new ComplianceService(
      mockPrisma as PrismaService,
      mockCrypto as CryptoService,
    );
  });

  it('should cryptographically record compliance acknowledgments with hashed IP address', async () => {
    const result = await complianceService.recordAcknowledgment(
      {
        action: 'SEC_RULE_206_4_1_ACK',
        actorId: 'user-12345',
        metadata: { version: '2026-Q3', jurisdiction: 'US-SEC' },
      },
      '198.51.100.42',
      'Mozilla/5.0 Institutional Terminal',
    );

    expect(result.auditId).toBe('audit-entry-uuid-999');
    expect(result.action).toBe('SEC_RULE_206_4_1_ACK');

    expect(mockCrypto.hashIpAddress).toHaveBeenCalledWith('198.51.100.42');
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'SEC_RULE_206_4_1_ACK',
          actorId: 'user-12345',
          ipAddressHash: 'mockiphash_a8723b49e29f',
          userAgent: 'Mozilla/5.0 Institutional Terminal',
          metadata: JSON.stringify({ version: '2026-Q3', jurisdiction: 'US-SEC' }),
        }),
      }),
    );
  });
});
