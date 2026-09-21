import { ApiProperty } from '@nestjs/swagger';

export class AssetQuoteDto {
  @ApiProperty({ example: 'BTC/USD', description: 'Asset benchmark symbol' })
  symbol!: string;

  @ApiProperty({ example: 'Bitcoin Global Spot', description: 'Asset title' })
  name!: string;

  @ApiProperty({
    example: 'CRYPTO',
    enum: ['CRYPTO', 'EQUITIES', 'COMMODITIES', 'TREASURIES'],
    description: 'Asset category classification',
  })
  category!: 'CRYPTO' | 'EQUITIES' | 'COMMODITIES' | 'TREASURIES';

  @ApiProperty({ example: 98450.25, description: 'Live spot or reference rate in USD' })
  price!: number;

  @ApiProperty({ example: '+3.48%', description: '24-hour percentage price delta' })
  change24h!: string;

  @ApiProperty({ example: '$42.8B', description: '24-hour global volume' })
  volume24h!: string;

  @ApiProperty({
    example: [95200, 95800, 96400, 97100, 96900, 97800, 98450],
    description: '7-day compressed sparkline price history points',
    type: [Number],
  })
  sparkline!: number[];

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'Timestamp of quote generation' })
  updatedAt!: string;
}

export class TickerResponseDto {
  @ApiProperty({ type: [AssetQuoteDto], description: 'Multi-asset live benchmarks' })
  quotes!: AssetQuoteDto[];

  @ApiProperty({ example: 'OPTIMAL', description: 'Telemetry feed health status' })
  feedStatus!: 'OPTIMAL' | 'STALE' | 'FALLBACK';

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  timestamp!: string;
}

export class HsmNodeStatusDto {
  @ApiProperty({ example: 'Geneva (CH-01)' })
  location!: string;

  @ApiProperty({ example: 'ACTIVE_ONLINE' })
  status!: 'ACTIVE_ONLINE' | 'STANDBY' | 'SYNCING';

  @ApiProperty({ example: '100.00%' })
  uptime!: string;

  @ApiProperty({ example: 'FIPS 140-3 Level 4' })
  securityStandard!: string;
}

export class TierAumDto {
  @ApiProperty({ example: '$4,820,000,000' })
  privateWealth!: string;

  @ApiProperty({ example: '$12,400,000,000' })
  institutional!: string;

  @ApiProperty({ example: '$17,220,000,000' })
  total!: string;
}

export class EnclaveTelemetryDto {
  @ApiProperty({
    example: '8f7a942b01c3e568d712f49018e3a2468bc1d9e248017c62534a81e94b23c91a',
    description: 'Cryptographic SHA-256 Merkle root hash of asset reserves',
  })
  merkleRoot!: string;

  @ApiProperty({
    example: 14.2,
    description: 'Global clearing and transaction settlement latency in milliseconds',
  })
  clearingLatencyMs!: number;

  @ApiProperty({ type: [HsmNodeStatusDto], description: 'Hardware Security Module cluster statuses' })
  hsmClusters!: HsmNodeStatusDto[];

  @ApiProperty({ type: TierAumDto, description: 'Custodied Assets Under Management breakdown' })
  tierAum!: TierAumDto;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z', description: 'UTC timestamp of cryptographic attestation' })
  lastAttestationUtc!: string;

  @ApiProperty({ example: 'OPTIMAL' })
  enclaveStatus!: 'OPTIMAL' | 'DEGRADED';
}
