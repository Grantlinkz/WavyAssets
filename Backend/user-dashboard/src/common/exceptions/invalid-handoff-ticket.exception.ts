import { UnauthorizedException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/system.constants';

export class InvalidHandoffTicketException extends UnauthorizedException {
  constructor(message = 'Single-use Authentication is invalid, expired, or already burned.') {
    super({
      errorCode: ERROR_CODES.ERR_INVALID_HANDOFF_TICKET,
      message,
    });
  }
}
