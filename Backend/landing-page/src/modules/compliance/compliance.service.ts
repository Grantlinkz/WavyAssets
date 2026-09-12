import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../../common/utils/crypto.service';
import {
  AcknowledgeComplianceDto,
  ComplianceAckResponseDto,
} from './dto/compliance.dto';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  /**
   * Cryptographically records a regulatory or disclosure acknowledgment without persisting raw IP addresses.
   */
  async recordAcknowledgment(
    dto: AcknowledgeComplianceDto,
    requesterIp = 'unknown',
    userAgent = 'unknown',
  ): Promise<ComplianceAckResponseDto> {
    const ipAddressHash = this.crypto.hashIpAddress(requesterIp);
    const metadataStr = dto.metadata ? JSON.stringify(dto.metadata) : null;

    const auditLog = await this.prisma.auditLog.create({
      data: {
        action: dto.action.trim(),
        actorId: dto.actorId?.trim() || null,
        ipAddressHash,
        userAgent: userAgent?.slice(0, 500) || null,
        metadata: metadataStr,
      },
    });

    this.logger.log(
      `Recorded regulatory compliance acknowledgment: ${auditLog.id} [Action: ${dto.action}]`,
    );

    return {
      auditId: auditLog.id,
      action: auditLog.action,
      acknowledgedAt: auditLog.createdAt.toISOString(),
      message:
        'Compliance disclosure acknowledgment cryptographically recorded in audit vault.',
    };
  }
}
