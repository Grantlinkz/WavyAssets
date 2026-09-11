import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ApiResponseDto<T = unknown> implements ApiResponse<T> {
  @ApiProperty({
    description: 'Denotes whether the requested operation succeeded or failed',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Payload containing the operation result data when successful',
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Sanitized error message if the operation failed',
    example: 'Resource not found',
  })
  error?: string;

  @ApiProperty({
    description: 'ISO-8601 UTC timestamp of response generation',
    example: '2026-09-11T12:00:00.000Z',
  })
  timestamp: string;
}
