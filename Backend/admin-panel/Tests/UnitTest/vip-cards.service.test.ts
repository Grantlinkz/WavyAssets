import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VipCardsService } from '../../src/modules/vip-cards/vip-cards.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  VipCardTier,
  VipCardType,
  VipShippingStatus,
} from '../../src/modules/vip-cards/dto/mint-card.dto';

describe('VipCardsService (Unit)', () => {
  let service: VipCardsService;
  let mockPrisma: any;
  let mockCryptoService: any;
  let mockEventsGateway: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
      vipCard: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: vi.fn(),
      },
      adminAuditLog: {
        create: vi.fn(),
      },
    };

    mockCryptoService = {
      encrypt: vi.fn().mockReturnValue('mocked_iv:mocked_tag:mocked_cipher'),
      decrypt: vi.fn().mockReturnValue('8492'),
      hashBlindIndex: vi.fn().mockReturnValue('mocked_blind_hash'),
      hashIpAddress: vi.fn().mockReturnValue('mocked_ip_hash'),
    };

    mockEventsGateway = {
      emitVipCardFrozenStateChanged: vi.fn(),
    };

    service = new VipCardsService(
      mockPrisma,
      mockCryptoService,
      mockEventsGateway,
    );
  });

  describe('getCards', () => {
    it('should return paginated cards and computed summary statistics omitting pinEncrypted', async () => {
      mockPrisma.vipCard.count.mockResolvedValueOnce(2);
      mockPrisma.vipCard.findMany
        .mockResolvedValueOnce([
          {
            id: 'card-1',
            userId: 'usr-1',
            cardNumberLast4: '8821',
            cardType: 'PHYSICAL',
            tier: 'OBSIDIAN',
            isFrozen: false,
            dailySpendLimit: 50000,
            pinEncrypted: 'sensitive-pin-payload',
            shippingStatus: 'DELIVERED',
            user: { id: 'usr-1', fullName: 'Alice Vault', email: 'alice@vault.ch' },
          },
          {
            id: 'card-2',
            userId: 'usr-2',
            cardNumberLast4: '9942',
            cardType: 'PHYSICAL',
            tier: 'BLACK',
            isFrozen: true,
            dailySpendLimit: 100000,
            pinEncrypted: 'sensitive-pin-payload-2',
            shippingStatus: 'IN_TRANSIT',
            user: { id: 'usr-2', fullName: 'Bob Trust', email: 'bob@trust.ch' },
          },
        ])
        .mockResolvedValueOnce([
          { isFrozen: false, dailySpendLimit: 50000 },
          { isFrozen: true, dailySpendLimit: 100000 },
        ]);

      const result = await service.getCards({ page: 1, limit: 10 });

      expect(result.cards).toHaveLength(2);
      expect((result.cards[0] as any).pinEncrypted).toBeUndefined();
      expect((result.cards[1] as any).pinEncrypted).toBeUndefined();
      expect(result.summary.totalIssued).toBe(2);
      expect(result.summary.activeCards).toBe(1);
      expect(result.summary.frozenCards).toBe(1);
      expect(result.summary.totalDailyLimitVolume).toBe(150000);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('getCardById', () => {
    it('should return safe card details for existing card', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce({
        id: 'card-1',
        userId: 'usr-1',
        cardNumberLast4: '8821',
        pinEncrypted: 'encrypted-secret',
        user: { id: 'usr-1', email: 'user@ch.ch' },
      });

      const card = await service.getCardById('card-1');
      expect(card.id).toBe('card-1');
      expect((card as any).pinEncrypted).toBeUndefined();
    });

    it('should throw NotFoundException if card does not exist', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce(null);

      await expect(service.getCardById('missing-card')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('mintCard', () => {
    it('should reject minting if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.mintCard('admin-1', {
          userId: 'non-existent-user',
          temporaryPin: '8492',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a new VIP card without interfering with existing cards', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'alice@vault.ch',
      });
      mockPrisma.vipCard.create.mockResolvedValueOnce({
        id: 'new-card-2',
        userId: 'usr-1',
        cardNumberLast4: '9901',
        cardType: 'PHYSICAL',
        tier: 'CELEBRITY',
        isFrozen: false,
        dailySpendLimit: 0,
        pinEncrypted: 'mocked_encrypted',
        shippingStatus: 'IN_TRANSIT',
        user: { id: 'usr-1', fullName: 'Alice Vault', email: 'alice@vault.ch' },
      });

      const card = await service.mintCard('admin-1', {
        userId: 'usr-1',
        temporaryPin: '9942',
        cardNumberLast4: '9901',
        tier: VipCardTier.CELEBRITY,
      });

      expect(card.id).toBe('new-card-2');
      expect(mockPrisma.vipCard.create).toHaveBeenCalled();
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'VIP_CARD_MINT',
            targetEntity: 'VipCard',
            targetId: 'new-card-2',
          }),
        }),
      );
    });

    it('should encrypt temporary PIN with AES-256-GCM and create VIP card', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'alice@vault.ch',
      });
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce(null);

      mockPrisma.vipCard.create.mockResolvedValueOnce({
        id: 'card-new-1',
        userId: 'usr-1',
        cardNumberLast4: '9901',
        cardType: 'PHYSICAL',
        tier: 'OBSIDIAN',
        isFrozen: false,
        dailySpendLimit: 50000,
        pinEncrypted: 'mocked_iv:mocked_tag:mocked_cipher',
        shippingStatus: 'IN_TRANSIT',
        user: { id: 'usr-1', fullName: 'Alice Vault', email: 'alice@vault.ch' },
      });

      const card = await service.mintCard('admin-1', {
        userId: 'usr-1',
        temporaryPin: '9942',
        cardNumberLast4: '9901',
        tier: VipCardTier.OBSIDIAN,
        cardType: VipCardType.PHYSICAL,
        shippingStatus: VipShippingStatus.IN_TRANSIT,
      });

      expect(mockCryptoService.encrypt).toHaveBeenCalledWith('9942');
      expect(card.id).toBe('card-new-1');
      expect((card as any).pinEncrypted).toBeUndefined();
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'VIP_CARD_MINT',
            targetEntity: 'VipCard',
            targetId: 'card-new-1',
          }),
        }),
      );
    });
  });

  describe('toggleFreeze', () => {
    it('should toggle isFrozen from false to true and broadcast WebSocket event', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce({
        id: 'card-1',
        userId: 'usr-1',
        cardNumberLast4: '8821',
        tier: 'OBSIDIAN',
        isFrozen: false,
        user: { id: 'usr-1', email: 'alice@vault.ch' },
      });

      mockPrisma.vipCard.findUniqueOrThrow.mockResolvedValueOnce({
        id: 'card-1',
        userId: 'usr-1',
        cardNumberLast4: '8821',
        tier: 'OBSIDIAN',
        isFrozen: true,
        pinEncrypted: 'secret',
        user: { id: 'usr-1', email: 'alice@vault.ch' },
      });

      const updated = await service.toggleFreeze('card-1', 'admin-1', 'Suspected fraud');

      expect(updated.isFrozen).toBe(true);
      expect((updated as any).pinEncrypted).toBeUndefined();
      expect(mockEventsGateway.emitVipCardFrozenStateChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          cardId: 'card-1',
          userId: 'usr-1',
          isFrozen: true,
        }),
      );
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'VIP_CARD_FREEZE_TOGGLE',
            diffBefore: JSON.stringify({ isFrozen: false }),
            diffAfter: JSON.stringify({ isFrozen: true, frozenByAdmin: true }),
          }),
        }),
      );
    });

    it('should toggle isFrozen from true to false', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce({
        id: 'card-1',
        userId: 'usr-1',
        cardNumberLast4: '8821',
        tier: 'OBSIDIAN',
        isFrozen: true,
        user: { id: 'usr-1', email: 'alice@vault.ch' },
      });

      mockPrisma.vipCard.findUniqueOrThrow.mockResolvedValueOnce({
        id: 'card-1',
        userId: 'usr-1',
        cardNumberLast4: '8821',
        tier: 'OBSIDIAN',
        isFrozen: false,
        pinEncrypted: 'secret',
        user: { id: 'usr-1', email: 'alice@vault.ch' },
      });

      const updated = await service.toggleFreeze('card-1', 'admin-1');

      expect(updated.isFrozen).toBe(false);
      expect(mockEventsGateway.emitVipCardFrozenStateChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          isFrozen: false,
        }),
      );
    });
  });

  describe('updateParameters', () => {
    it('should update spend limits, card type, and custody shipping status', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce({
        id: 'card-1',
        dailySpendLimit: 50000,
        cardType: 'PHYSICAL',
        shippingStatus: 'IN_TRANSIT',
      });

      mockPrisma.vipCard.update.mockResolvedValueOnce({
        id: 'card-1',
        dailySpendLimit: 250000,
        cardType: 'PHYSICAL',
        shippingStatus: 'DELIVERED',
        pinEncrypted: 'secret',
        user: { id: 'usr-1', email: 'alice@vault.ch' },
      });

      const updated = await service.updateParameters('card-1', 'admin-1', {
        dailySpendLimit: 250000,
        shippingStatus: VipShippingStatus.DELIVERED,
      });

      expect(updated.dailySpendLimit).toBe(250000);
      expect(updated.shippingStatus).toBe('DELIVERED');
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'VIP_CARD_PARAMETERS_UPDATE',
          }),
        }),
      );
    });
  });

  describe('deleteCard', () => {
    it('should delete VIP card and create audit log', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce({
        id: 'card-to-delete',
        userId: 'usr-1',
        cardNumberLast4: '4321',
        tier: 'OBSIDIAN',
        user: { id: 'usr-1', email: 'alice@vault.ch' },
      });
      mockPrisma.vipCard.delete.mockResolvedValueOnce({ id: 'card-to-delete' });

      const res = await service.deleteCard('card-to-delete', 'admin-1');

      expect(res.success).toBe(true);
      expect(res.deletedCardId).toBe('card-to-delete');
      expect(mockPrisma.vipCard.delete).toHaveBeenCalledWith({
        where: { id: 'card-to-delete' },
      });
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'VIP_CARD_DELETE',
            targetEntity: 'VipCard',
            targetId: 'card-to-delete',
          }),
        }),
      );
    });

    it('should throw NotFoundException if card does not exist on delete', async () => {
      mockPrisma.vipCard.findUnique.mockResolvedValueOnce(null);

      await expect(service.deleteCard('non-existent', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
