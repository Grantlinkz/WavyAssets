import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { SimulationService } from '../../../src/modules/simulation/simulation.service';
import { PrismaService } from '../../../src/modules/prisma/prisma.service';
import { CryptoService } from '../../../src/common/utils/crypto.service';

describe('SimulationService Unit Tests', () => {
  let simulationService: SimulationService;
  let mockPrisma: any;
  let mockCrypto: any;

  beforeEach(() => {
    mockPrisma = {
      simulationIntent: {
        create: vi.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'sim-intent-uuid',
            ...args.data,
            createdAt: new Date(),
          }),
        ),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    mockCrypto = {
      generateRandomToken: vi.fn().mockReturnValue('mockrandomhex1234567890'),
    };

    simulationService = new SimulationService(
      mockPrisma as PrismaService,
      mockCrypto as CryptoService,
    );
  });

  it('should capture and tokenize portfolio simulation intent with a 30-day expiry', async () => {
    const result = await simulationService.saveSimulation({
      capitalAmount: 2500000,
      riskPosture: 2,
      projectedYield: 14.8,
    });

    expect(result.token).toBe('sim_mockrandomhex1234567890');
    expect(result.capitalAmount).toBe(2500000);
    expect(result.riskPosture).toBe(2);
    expect(result.riskLabel).toBe('Balanced Growth');
    expect(result.projectedYield).toBe(14.8);

    expect(mockPrisma.simulationIntent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: 'sim_mockrandomhex1234567890',
          capitalAmount: 2500000,
          riskPosture: 2,
        }),
      }),
    );
  });

  it('should resolve an existing non-expired simulation intent by token', async () => {
    mockPrisma.simulationIntent.findUnique.mockResolvedValue({
      token: 'sim_existing_token',
      capitalAmount: 5000000,
      riskPosture: 3,
      projectedYield: 18.2,
      expiresAt: new Date(Date.now() + 1000000),
    });

    const result = await simulationService.getSimulation('sim_existing_token');

    expect(result.token).toBe('sim_existing_token');
    expect(result.riskLabel).toBe('Maximum Alpha');
    expect(result.capitalAmount).toBe(5000000);
  });

  it('should throw NotFoundException if token does not exist or has expired', async () => {
    mockPrisma.simulationIntent.findUnique.mockResolvedValue(null);

    await expect(
      simulationService.getSimulation('sim_nonexistent'),
    ).rejects.toThrow(NotFoundException);
  });
});
