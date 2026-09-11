import {
  Controller,
  Post,
  Body,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ComplianceService } from './compliance.service';
import {
  AcknowledgeComplianceDto,
  ComplianceAckResponseDto,
} from './dto/compliance.dto';

@ApiTags('Compliance & Regulatory Disclosures')
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('ack')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({
    summary: 'Record compliance disclosure acknowledgment',
    description:
      'Logs regulatory disclaimer acceptance (e.g. SEC Rule 206(4)-1, FINMA, GDPR consent) with an anonymized IP hash and timestamp.',
  })
  @ApiResponse({
    status: 201,
    description: 'Compliance disclosure acknowledgment recorded in audit vault',
    type: ComplianceAckResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed on action or payload format',
  })
  async acknowledge(
    @Body() dto: AcknowledgeComplianceDto,
    @Ip() requesterIp: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<ComplianceAckResponseDto> {
    return this.complianceService.recordAcknowledgment(
      dto,
      requesterIp,
      userAgent,
    );
  }
}
