import { UnprocessableEntityException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/system.constants';

export class LedgerImbalanceException extends UnprocessableEntityException {
  constructor(
    message = 'Ledger transaction violates the zero-sum invariant (Debits + Credits != 0).',
    public readonly netImbalance?: number,
  ) {
    super({
      errorCode: ERROR_CODES.ERR_LEDGER_IMBALANCE,
      message,
      netImbalance,
    });
  }
}
