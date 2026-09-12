import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { NewsletterService } from './newsletter.service';
import {
  SubscribeNewsletterDto,
  VerifyNewsletterQueryDto,
  NewsletterResponseDto,
} from './dto/newsletter.dto';

@ApiTags('Newsletter & Research Subscriptions')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Subscribe to institutional research intelligence',
    description:
      'Initiates double opt-in subscription, delivering a signed verification token via email to authenticate subscriber intent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Double opt-in verification link dispatched',
    type: NewsletterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Disposable email address detected or invalid email syntax',
  })
  async subscribe(
    @Body() dto: SubscribeNewsletterDto,
  ): Promise<NewsletterResponseDto> {
    return this.newsletterService.subscribe(dto);
  }

  @Get('verify')
  @ApiOperation({
    summary: 'Verify double opt-in subscription token',
    description:
      'Confirms the subscriber identity using the cryptographic verification token dispatched via email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription confirmed successfully',
    type: NewsletterResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Invalid or expired verification token',
  })
  async verify(
    @Query() query: VerifyNewsletterQueryDto,
  ): Promise<NewsletterResponseDto> {
    return this.newsletterService.verifySubscription(query.token);
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unsubscribe from research dispatches',
    description: 'Safely removes the subscriber record from future intelligence dispatches.',
  })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribed successfully',
  })
  async unsubscribe(@Body() dto: SubscribeNewsletterDto): Promise<{ message: string }> {
    return this.newsletterService.unsubscribe(dto.email);
  }
}
