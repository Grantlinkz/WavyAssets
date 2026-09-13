import {
  Controller,
  Post,
  Body,
  Ip,
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
import { LeadsService } from './leads.service';
import { LeadInquiryDto, LeadInquiryResponseDto } from './dto/lead.dto';

@ApiTags('Leads & Institutional Mandates')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('inquire')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Submit institutional mandate inquiry',
    description:
      'Ingests, scores corporate domains, encrypts sensitive contact PII via AES-256-GCM, and routes multi-million-dollar mandates to executive custody desks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lead inquiry ingested and queued successfully',
    type: LeadInquiryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or disposable email address detected',
  })
  async inquire(
    @Body() dto: LeadInquiryDto,
    @Ip() requesterIp: string,
  ): Promise<LeadInquiryResponseDto> {
    return this.leadsService.processInquiry(dto, requesterIp);
  }
}
