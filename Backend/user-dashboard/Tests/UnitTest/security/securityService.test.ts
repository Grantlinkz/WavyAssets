import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecurityService } from '../../../src/modules/security/security.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { AssetRail } from '../../../src/modules/security/dto/security.dto';

describe('SecurityService — Session Governance, WebAuthn FIDO2 & Inviolable 48h Time-Lock', () => {
  let securityService: SecurityService;
  let mockPrisma: any;
  let mockConfigService: any;

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      session: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      webAuthnCredential: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      whitelistDestination: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-001' }),
      },
    };

    mockConfigService = {
      get: vi.fn().mockReturnValue('test-jwt-secret-key-12345'),
    };

    securityService = new SecurityService(
      mockPrisma as unknown as PrismaService,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('Session Governance', () => {
    it('lists active user sessions and identifies current session', async () => {
      mockPrisma.session.findMany.mockResolvedValue([
        {
          id: 'sess-001',
          ipAddress: '192.168.1.10',
          userAgent: 'Chrome on macOS',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
        },
        {
          id: 'sess-002',
          ipAddress: '10.0.0.5',
          userAgent: 'Firefox on Linux',
          createdAt: new Date(Date.now() - 7200000),
          expiresAt: new Date(Date.now() + 3600000),
        },
      ]);

      const sessions = await securityService.getSessions(testUserId);

      expect(sessions.length).toBe(2);
      expect(sessions[0].isCurrentSession).toBe(true);
      expect(sessions[1].isCurrentSession).toBe(false);
      expect(sessions[0].isExpired).toBe(false);
    });

    it('revokes a specific session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        id: 'sess-002',
        userId: testUserId,
        ipAddress: '10.0.0.5',
      });

      const result = await securityService.revokeSession(testUserId, 'sess-002');

      expect(result.success).toBe(true);
      expect(mockPrisma.session.delete).toHaveBeenCalledWith({ where: { id: 'sess-002' } });
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('atomically revokes all concurrent sessions except the most recent', async () => {
      mockPrisma.session.findMany.mockResolvedValue([
        { id: 'sess-current' },
        { id: 'sess-old-1' },
        { id: 'sess-old-2' },
      ]);
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 2 });

      const result = await securityService.revokeOtherSessions(testUserId);

      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(2);
      expect(result.retainedSessionId).toBe('sess-current');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('WebAuthn FIDO2 Hardware Keys', () => {
    it('generates cryptographic registration challenge options', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        email: 'Global@investor.ch',
        fullName: 'Baron von Zurich',
      });

      const options = await securityService.generateWebAuthnChallenge(testUserId);

      expect(options.challenge.length).toBe(64);
      expect(options.rp.id).toBe('wavyassets.com');
      expect(options.timeout).toBe(60000);
    });

    it('registers hardware credential with public key', async () => {
      mockPrisma.webAuthnCredential.findUnique.mockResolvedValue(null);
      mockPrisma.webAuthnCredential.create.mockResolvedValue({
        credentialId: 'yubikey-cred-001',
        deviceLabel: 'YubiKey 5C NFC Primary',
        createdAt: new Date(),
      });

      const result = await securityService.verifyWebAuthnRegistration(testUserId, {
        credentialId: 'yubikey-cred-001',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz5',
        deviceLabel: 'YubiKey 5C NFC Primary',
      });

      expect(result.success).toBe(true);
      expect(result.credentialId).toBe('yubikey-cred-001');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('prevents registering duplicate credential ID', async () => {
      mockPrisma.webAuthnCredential.findUnique.mockResolvedValue({
        credentialId: 'yubikey-cred-001',
      });

      await expect(
        securityService.verifyWebAuthnRegistration(testUserId, {
          credentialId: 'yubikey-cred-001',
          publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz5',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('verifies assertion and increments counter', async () => {
      mockPrisma.webAuthnCredential.findUnique.mockResolvedValue({
        id: 'db-cred-001',
        userId: testUserId,
        credentialId: 'yubikey-cred-001',
        deviceLabel: 'YubiKey 5C NFC',
        counter: 12,
      });
      mockPrisma.webAuthnCredential.update.mockResolvedValue({
        credentialId: 'yubikey-cred-001',
        deviceLabel: 'YubiKey 5C NFC',
        counter: 13,
      });

      const result = await securityService.verifyWebAuthnAssertion(testUserId, {
        credentialId: 'yubikey-cred-001',
        assertion: 'valid_cryptographic_assertion_signature_blob_hex',
      });

      expect(result.verified).toBe(true);
      expect(result.counter).toBe(13);
    });
  });

  describe('Inviolable 48-Hour Withdrawal Whitelist Time-Lock', () => {
    it('creates whitelist destination strictly in QUARANTINE with 48h lock and 2 required signers', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });
      mockPrisma.whitelistDestination.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'dest-001',
          ...args.data,
        }),
      );

      const before = Date.now();
      const result = await securityService.createWhitelistDestination(testUserId, {
        assetRail: AssetRail.ERC20_USDC,
        destinationLabel: 'Geneva Cold Custody Vault B',
        beneficiaryOrg: 'Global Wealth Escrow AG',
        addressOrIban: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      });

      expect(result.success).toBe(true);
      expect(result.destination.status).toBe('QUARANTINE');
      expect(result.destination.signersRequired).toBe(2);
      expect(result.destination.signersCompleted).toBe(1);

      // Verify quarantineUntil is approximately 48 hours in the future
      const quarantineTime = new Date(result.destination.quarantineUntil).getTime();
      const diffHours = (quarantineTime - before) / (3600 * 1000);
      expect(diffHours).toBeGreaterThanOrEqual(47.9);
      expect(diffHours).toBeLessThanOrEqual(48.1);
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('co-signing destination preserves QUARANTINE status if 48 hours have not elapsed', async () => {
      // 48h lock is still active (quarantineUntil is in the future)
      const futureDate = new Date(Date.now() + 24 * 3600 * 1000); // 24h remaining
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-001',
        userId: testUserId,
        status: 'QUARANTINE',
        quarantineUntil: futureDate,
        signersRequired: 2,
        signersCompleted: 1,
      });

      mockPrisma.whitelistDestination.update.mockResolvedValue({
        id: 'dest-001',
        signersCompleted: 2,
        signersRequired: 2,
        status: 'QUARANTINE', // Remains QUARANTINE!
        quarantineUntil: futureDate,
      });

      const result = await securityService.signWhitelistDestination(testUserId, 'dest-001', {
        signatureConfirmation: true,
      });

      expect(result.success).toBe(true);
      expect(result.signersCompleted).toBe(2);
      expect(result.status).toBe('QUARANTINE'); // Invariant: must not unlock early!
      expect(result.timeLockElapsed).toBe(false);
    });

    it('co-signing destination unlocks to ACTIVE when both 2 signatures and 48-hour time-lock are satisfied', async () => {
      // 48 hours have already elapsed
      const pastDate = new Date(Date.now() - 1000);
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-002',
        userId: testUserId,
        status: 'QUARANTINE',
        quarantineUntil: pastDate,
        signersRequired: 2,
        signersCompleted: 1,
      });

      mockPrisma.whitelistDestination.update.mockResolvedValue({
        id: 'dest-002',
        signersCompleted: 2,
        signersRequired: 2,
        status: 'ACTIVE', // Unlocks to ACTIVE!
        quarantineUntil: pastDate,
      });

      const result = await securityService.signWhitelistDestination(testUserId, 'dest-002', {
        signatureConfirmation: true,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('ACTIVE');
      expect(result.timeLockElapsed).toBe(true);
      expect(result.message).toContain('Whitelist address is now ACTIVE');
    });

    it('revokes a destination immediately upon user command', async () => {
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-003',
        userId: testUserId,
        status: 'QUARANTINE',
      });

      mockPrisma.whitelistDestination.update.mockResolvedValue({
        id: 'dest-003',
        status: 'REVOKED',
      });

      const result = await securityService.revokeWhitelistDestination(testUserId, 'dest-003');

      expect(result.success).toBe(true);
      expect(result.status).toBe('REVOKED');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
