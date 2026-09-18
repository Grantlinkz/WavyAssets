import { UnprocessableEntityException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/system.constants';

export class InsufficientAvailableBalanceException extends UnprocessableEntityException {
  constructor(
    message = 'Insufficient available balance to execute order or withdrawal.',
    public readonly requestedAmount?: number,
    public readonly availableBalance?: number,
  ) {
    super({
      errorCode: ERROR_CODES.ERR_INSUFFICIENT_FUNDS,
      message,
      requestedAmount,
      availableBalance,
    });
  }
}
