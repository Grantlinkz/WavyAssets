import { ForbiddenException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/system.constants';

export class QuarantineTimeLockException extends ForbiddenException {
  constructor(
    message = 'Destination is currently quarantined under the 48-hour security time-lock.',
    public readonly quarantineUntil?: Date,
  ) {
    super({
      errorCode: ERROR_CODES.ERR_DESTINATION_QUARANTINED,
      message,
      quarantineUntil: quarantineUntil ? quarantineUntil.toISOString() : undefined,
    });
  }
}
