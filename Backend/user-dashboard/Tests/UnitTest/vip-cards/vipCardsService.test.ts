import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VipCardsService } from '../../../src/modules/vip-cards/vip-cards.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CryptoUtils } from '../../../src/common/utils/crypto.utils';
import { CardTier, CardType, ConciergeCategory, ConciergeUrgency } from '../../../src/modules/vip-cards/dto/vip-cards.dto';

describe('VipCardsService — Card Status, Tier Progression, Ephemeral CVV & Concierge Dispatch', () => {
  let vipCardsService: VipCardsService;
  let mockPrisma: any;
  let mockConfigService: any;

  const testUserId = 'usr-institutional-001';
  const testKeyHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  beforeEach(() => {
    mockPrisma = {
      vipCard: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      ledgerAccount: {
        findMany: vi.fn(),
      },
      cryptoHolding: {
        findMany: vi.fn(),
      },
      stockPosition: {
        findMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      webAuthnCredential: {
        count: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-001' }),
      },
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'CIPHER_KEY_HEX') return testKeyHex;
        return null;
      }),
    };

    vipCardsService = new VipCardsService(
      mockPrisma as unknown as PrismaService,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('getCardStatus', () => {
    it('returns card status, masked number, and computes tier progression towards next tier', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        id: 'card-obsidian-001',
        userId: testUserId,
        cardNumberLast4: '8842',
        cardType: 'PHYSICAL',
        tier: 'OBSIDIAN',
        isFrozen: false,
        dailySpendLimit: 100000.0,
        pinEncrypted: 'mock:enc:pin',
        shippingStatus: 'DELIVERED',
        updatedAt: new Date('2026-09-01T12:00:00.000Z'),
      });

      mockPrisma.ledgerAccount.findMany.mockResolvedValue([
        { balance: 500000.0 },
      ]);
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([
        { quantity: 20, avgBuyPrice: 60000 }, // 1.2M
      ]);
      mockPrisma.stockPosition.findMany.mockResolvedValue([
        { shares: 1000, avgCostBasis: 500 }, // 500k
      ]);

      const result = await vipCardsService.getCardStatus(testUserId);

      expect(result.id).toBe('card-obsidian-001');
      expect(result.cardNumberMasked).toBe('•••• •••• •••• 8842');
      expect(result.tier).toBe('OBSIDIAN');
      expect(result.tierProgression.currentTier).toBe('OBSIDIAN');
      expect(result.tierProgression.nextTier).toBe('BLACK');
      expect(result.tierProgression.nextTierThreshold).toBe(10000000);
      expect(result.tierProgression.currentAum).toBe(2200000);
      expect(result.tierProgression.progressPercentage).toBe(22);
    });

    it('auto-provisions a default card if none exists for the user', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue(null);
      mockPrisma.vipCard.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'card-new-001',
          ...args.data,
          updatedAt: new Date(),
        }),
      );
      mockPrisma.ledgerAccount.findMany.mockResolvedValue([]);
      mockPrisma.cryptoHolding.findMany.mockResolvedValue([]);
      mockPrisma.stockPosition.findMany.mockResolvedValue([]);

      const result = await vipCardsService.getCardStatus(testUserId);

      expect(mockPrisma.vipCard.create).toHaveBeenCalled();
      expect(result.cardNumberLast4).toBe('8842');
      expect(result.tier).toBe(CardTier.OBSIDIAN);
    });
  });

  describe('updateCardControls', () => {
    it('updates freeze status and spending limits within tier boundary', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        id: 'card-obsidian-001',
        userId: testUserId,
        tier: 'OBSIDIAN',
        isFrozen: false,
        dailySpendLimit: 50000.0,
      });

      mockPrisma.vipCard.update.mockResolvedValue({
        id: 'card-obsidian-001',
        isFrozen: true,
        cardType: 'VIRTUAL',
        dailySpendLimit: 80000.0,
        updatedAt: new Date(),
      });

      const result = await vipCardsService.updateCardControls(testUserId, {
        isFrozen: true,
        cardType: CardType.VIRTUAL,
        dailySpendLimit: 80000.0,
      });

      expect(result.success).toBe(true);
      expect(result.isFrozen).toBe(true);
      expect(result.dailySpendLimit).toBe(80000.0);
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('rejects daily spend limit exceeding the tier maximum', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        id: 'card-silver-001',
        userId: testUserId,
        tier: 'SILVER',
        isFrozen: false,
        dailySpendLimit: 10000.0,
      });

      await expect(
        vipCardsService.updateCardControls(testUserId, {
          dailySpendLimit: 50000.0, // Silver max is $25,000
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if user has no card to update', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue(null);

      await expect(
        vipCardsService.updateCardControls('unknown-user', { isFrozen: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('revealSensitive', () => {
    it('decrypts stored AES-256-GCM PIN and derives dynamic 60s CVV upon valid passphrase', async () => {
      const plainPin = '7741';
      const encryptedPin = CryptoUtils.encryptAes256Gcm(plainPin, testKeyHex);
      const passphraseHash = await argon2.hash('SecretPassphrase2026!');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        passphraseHash,
      });

      mockPrisma.vipCard.findUnique.mockResolvedValue({
        id: 'card-obsidian-001',
        userId: testUserId,
        pinEncrypted: encryptedPin,
      });

      const result = await vipCardsService.revealSensitive(testUserId, {
        passphrase: 'SecretPassphrase2026!',
      });

      expect(result.success).toBe(true);
      expect(result.pin).toBe('7741');
      expect(result.cvv).toMatch(/^\d{3}$/);
      expect(result.timeRemainingSeconds).toBeGreaterThan(0);
      expect(result.timeRemainingSeconds).toBeLessThanOrEqual(60);
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('rejects reveal attempt with incorrect passphrase', async () => {
      const passphraseHash = await argon2.hash('CorrectPassphrase123!');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        passphraseHash,
      });

      await expect(
        vipCardsService.revealSensitive(testUserId, {
          passphrase: 'WrongPassphrase',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getPrivileges & getShippingTracker', () => {
    it('returns bespoke fee schedule and VIP tier perks', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        userId: testUserId,
        tier: 'BLACK',
      });

      const privileges = await vipCardsService.getPrivileges(testUserId);
      expect(privileges.tier).toBe('BLACK');
      expect(privileges.makerFeePct).toBe(0.0);
      expect(privileges.conciergeSlaMinutes).toBe(15);
    });

    it('returns shipping tracker status and courier milestones', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValue({
        userId: testUserId,
        cardNumberLast4: '8842',
        shippingStatus: 'DELIVERED',
      });

      const tracker = await vipCardsService.getShippingTracker(testUserId);
      expect(tracker.carrier).toContain('FedEx');
      expect(tracker.status).toBe('DELIVERED');
      expect(tracker.milestones.length).toBeGreaterThan(3);
    });
  });

  describe('createConciergeTicket', () => {
    it('dispatches an authenticated concierge service ticket and logs audit event', async () => {
      const result = await vipCardsService.createConciergeTicket(testUserId, {
        subject: 'Monaco Yacht Charter Booking',
        category: ConciergeCategory.CHARTER,
        urgency: ConciergeUrgency.IMMEDIATE,
        message: 'Requesting 50m tri-deck charter for Monaco Grand Prix weekend.',
      });

      expect(result.success).toBe(true);
      expect(result.ticketId).toMatch(/^CCG-/);
      expect(result.estimatedResponseMinutes).toBe(15);
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
