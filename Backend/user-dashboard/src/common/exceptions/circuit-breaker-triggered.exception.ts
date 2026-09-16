import { ForbiddenException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/system.constants';

export class CircuitBreakerTriggeredException extends ForbiddenException {
  constructor(message = 'Operation halted: Emergency algorithmic circuit breaker is currently active.') {
    super({
      errorCode: ERROR_CODES.ERR_CIRCUIT_BREAKER_ACTIVE,
      message,
    });
  }
}
