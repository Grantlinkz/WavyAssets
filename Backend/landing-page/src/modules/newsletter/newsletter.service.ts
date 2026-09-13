import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../../common/utils/crypto.service';
import { EmailService } from '../auth/services/email.service';
import { SubscribeNewsletterDto, NewsletterResponseDto } from './dto/newsletter.dto';
import { maskEmail } from '../../common/interceptors/pii-redaction.interceptor';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'sharklasers.com',
  'yopmail.com',
]);

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private readonly clientUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.clientUrl =
      this.configService.get<string>('server.clientUrl') || 'http://localhost:5173';
  }

  /**
   * Subscribes an email to the research dispatch with double opt-in verification.
   */
  async subscribe(dto: SubscribeNewsletterDto): Promise<NewsletterResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const domain = normalizedEmail.split('@')[1];

    if (domain && DISPOSABLE_DOMAINS.has(domain)) {
      throw new BadRequestException('Disposable email addresses are not accepted for research subscriptions');
    }

    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing && existing.isConfirmed) {
      return {
        message: 'This email address is already verified and actively subscribed to research dispatches.',
        email: maskEmail(normalizedEmail),
        isConfirmed: true,
      };
    }

    const verificationToken = this.crypto.generateRandomToken(32);

    if (existing) {
      await this.prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          verificationToken,
          isConfirmed: false,
        },
      });
    } else {
      await this.prisma.newsletterSubscriber.create({
        data: {
          email: normalizedEmail,
          verificationToken,
          isConfirmed: false,
        },
      });
    }

    // Build Swiss double opt-in link
    const verificationLink = `${this.clientUrl}/newsletter/verify?token=${verificationToken}`;
    await this.emailService.sendNewsletterVerificationEmail(normalizedEmail, verificationLink);

    this.logger.log(`Dispatched double opt-in newsletter link to: ${maskEmail(normalizedEmail)}`);

    return {
      message: 'A double opt-in verification link has been dispatched to your email address.',
      email: maskEmail(normalizedEmail),
      isConfirmed: false,
    };
  }

  /**
   * Confirms double opt-in subscription using verification token.
   */
  async verifySubscription(token: string): Promise<NewsletterResponseDto> {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { verificationToken: token },
    });

    if (!subscriber) {
      throw new NotFoundException('Invalid or expired research newsletter verification token');
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        verificationToken: null,
      },
    });

    this.logger.log(`Confirmed double opt-in subscription for: ${maskEmail(subscriber.email)}`);

    return {
      message: 'Subscription successfully confirmed. You will receive executive research publications.',
      email: maskEmail(subscriber.email),
      isConfirmed: true,
    };
  }

  /**
   * Unsubscribes an email address from newsletter dispatches.
   */
  async unsubscribe(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (subscriber) {
      await this.prisma.newsletterSubscriber.delete({
        where: { id: subscriber.id },
      });
      this.logger.log(`Unsubscribed: ${maskEmail(normalizedEmail)}`);
    }

    return {
      message: 'You have been successfully removed from our research distribution list.',
    };
  }
}
