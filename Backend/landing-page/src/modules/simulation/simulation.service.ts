import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../../common/utils/crypto.service';
import { SaveSimulationDto, SimulationResponseDto } from './dto/simulation.dto';

const RISK_LABELS: Record<number, string> = {
  1: 'Capital Preservation',
  2: 'Balanced Growth',
  3: 'Maximum Alpha',
};

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  /**
   * Captures and tokenizes user portfolio simulation parameters.
   */
  async saveSimulation(dto: SaveSimulationDto): Promise<SimulationResponseDto> {
    const rawToken = this.crypto.generateRandomToken(24);
    const token = `sim_${rawToken}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day TTL

    const record = await this.prisma.simulationIntent.create({
      data: {
        token,
        capitalAmount: dto.capitalAmount,
        riskPosture: dto.riskPosture,
        projectedYield: dto.projectedYield,
        expiresAt,
      },
    });

    this.logger.log(
      `Saved simulation intent: ${token} [Capital: $${dto.capitalAmount.toLocaleString()}, Posture: ${RISK_LABELS[dto.riskPosture]}]`,
    );

    return {
      token: record.token,
      capitalAmount: record.capitalAmount,
      riskPosture: record.riskPosture,
      riskLabel: RISK_LABELS[record.riskPosture] || 'Custom Strategy',
      projectedYield: record.projectedYield,
      expiresAt: record.expiresAt.toISOString(),
    };
  }

  /**
   * Resolves a simulation intent token for pre-filling onboarding allocations.
   */
  async getSimulation(token: string): Promise<SimulationResponseDto> {
    const record = await this.prisma.simulationIntent.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new NotFoundException('Simulation intent challenge expired or does not exist');
    }

    return {
      token: record.token,
      capitalAmount: record.capitalAmount,
      riskPosture: record.riskPosture,
      riskLabel: RISK_LABELS[record.riskPosture] || 'Custom Strategy',
      projectedYield: record.projectedYield,
      expiresAt: record.expiresAt.toISOString(),
    };
  }

  /**
   * Binds an intent token to a newly registered or authenticated institutional user.
   */
  async linkToUser(token: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.simulationIntent.update({
        where: { token },
        data: { userId },
      });
      return true;
    } catch {
      return false;
    }
  }
}
