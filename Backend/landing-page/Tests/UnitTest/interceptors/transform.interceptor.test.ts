import { describe, it, expect, vi } from 'vitest';
import { of, firstValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

describe('TransformInterceptor (Standardized Response Envelope)', () => {
  const interceptor = new TransformInterceptor();

  it('should wrap raw payload into standardized { success: true, data, timestamp } envelope', async () => {
    const rawPayload = { asset: 'BTC', price: 95000 };
    const mockContext = {} as ExecutionContext;
    const mockHandler: CallHandler = {
      handle: () => of(rawPayload),
    };

    const result$ = interceptor.intercept(mockContext, mockHandler);
    const envelope = await firstValueFrom(result$);

    expect(envelope).toBeDefined();
    expect(envelope.success).toBe(true);
    expect(envelope.data).toEqual(rawPayload);
    expect(envelope.timestamp).toBeDefined();
    expect(new Date(envelope.timestamp).getTime()).not.toBeNaN();
  });

  it('should preserve pre-formed ApiResponse envelopes without double-wrapping', async () => {
    const preFormedEnvelope = {
      success: true,
      data: { status: 'healthy' },
      timestamp: '2026-09-11T10:00:00.000Z',
    };
    const mockContext = {} as ExecutionContext;
    const mockHandler: CallHandler = {
      handle: () => of(preFormedEnvelope),
    };

    const result$ = interceptor.intercept(mockContext, mockHandler);
    const envelope = await firstValueFrom(result$);

    expect(envelope).toEqual(preFormedEnvelope);
    expect(envelope.timestamp).toBe('2026-09-11T10:00:00.000Z');
  });

  it('should wrap null or undefined responses into standardized envelope', async () => {
    const mockContext = {} as ExecutionContext;
    const mockHandler: CallHandler = {
      handle: () => of(null),
    };

    const result$ = interceptor.intercept(mockContext, mockHandler);
    const envelope = await firstValueFrom(result$);

    expect(envelope.success).toBe(true);
    expect(envelope.data).toBeNull();
    expect(envelope.timestamp).toBeDefined();
  });
});
