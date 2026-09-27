import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T> | any>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T> | any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an envelope with success: true and data property
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: data !== undefined ? data : null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
