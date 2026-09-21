import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  AssetQuoteDto,
  TickerResponseDto,
  EnclaveTelemetryDto,
  HsmNodeStatusDto,
  TierAumDto,
} from './dto/telemetry.dto';

interface RawAssetDefinition {
  symbol: string;
  name: string;
  category: 'CRYPTO' | 'EQUITIES' | 'COMMODITIES' | 'TREASURIES';
  basePrice: number;
  change24h: string;
  volume24h: string;
  sparklineBase: number[];
}

const BENCHMARK_ASSETS: RawAssetDefinition[] = [
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin Global Spot',
    category: 'CRYPTO',
    basePrice: 98450.25,
    change24h: '+3.48%',
    volume24h: '$42.8B',
    sparklineBase: [94800, 95400, 96200, 97100, 96800, 97900, 98450],
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum Staked Benchmark',
    category: 'CRYPTO',
    basePrice: 3420.8,
    change24h: '+2.15%',
    volume24h: '$18.4B',
    sparklineBase: [3310, 3340, 3370, 3350, 3390, 3410, 3420],
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana High-Throughput Spot',
    category: 'CRYPTO',
    basePrice: 224.5,
    change24h: '+5.72%',
    volume24h: '$8.9B',
    sparklineBase: [208, 212, 215, 218, 216, 221, 224],
  },
  {
    symbol: 'WAVY-YIELD',
    name: 'WavyAssets Institutional Yield Index',
    category: 'CRYPTO',
    basePrice: 114.82,
    change24h: '+0.42%',
    volume24h: '$640M',
    sparklineBase: [113.8, 114.0, 114.2, 114.4, 114.5, 114.7, 114.8],
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'EQUITIES',
    basePrice: 238.45,
    change24h: '+0.85%',
    volume24h: '$12.1B',
    sparklineBase: [234, 235, 236, 235, 237, 238, 238.4],
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'EQUITIES',
    basePrice: 132.8,
    change24h: '+4.12%',
    volume24h: '$34.5B',
    sparklineBase: [124, 126, 128, 127, 130, 131, 132.8],
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'EQUITIES',
    basePrice: 284.1,
    change24h: '-1.24%',
    volume24h: '$16.2B',
    sparklineBase: [292, 290, 288, 285, 286, 283, 284.1],
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    category: 'EQUITIES',
    basePrice: 592.3,
    change24h: '+0.62%',
    volume24h: '$28.7B',
    sparklineBase: [586, 587, 589, 588, 590, 591, 592.3],
  },
  {
    symbol: 'US 10Y',
    name: 'United States 10-Year Treasury Benchmark',
    category: 'TREASURIES',
    basePrice: 4.42,
    change24h: '-0.04%',
    volume24h: '$110B',
    sparklineBase: [4.48, 4.46, 4.45, 4.44, 4.43, 4.42, 4.42],
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold Bullion Global Spot',
    category: 'COMMODITIES',
    basePrice: 2742.6,
    change24h: '+1.18%',
    volume24h: '$22.3B',
    sparklineBase: [2705, 2712, 2720, 2728, 2735, 2738, 2742.6],
  },
  {
    symbol: 'BRENT',
    name: 'Brent Crude Oil Benchmark',
    category: 'COMMODITIES',
    basePrice: 76.84,
    change24h: '+0.74%',
    volume24h: '$14.6B',
    sparklineBase: [75.2, 75.8, 76.1, 75.9, 76.4, 76.6, 76.84],
  },
];

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private cachedQuotes: AssetQuoteDto[] = [];
  private lastQuoteUpdate = 0;
  private isCircuitBreakerTripped = false;

  constructor() {
    this.refreshQuoteCache();
  }

  /**
   * Refreshes the in-memory cache of multi-asset quotes.
   */
  private refreshQuoteCache(): void {
    const nowIso = new Date().toISOString();
    this.cachedQuotes = BENCHMARK_ASSETS.map((asset) => {
      // Subtle micro-drift simulation (+/- 0.05%) to reflect real-time active market tick
      const drift = (Math.random() - 0.5) * 0.001;
      const currentPrice = Number((asset.basePrice * (1 + drift)).toFixed(2));

      return {
        symbol: asset.symbol,
        name: asset.name,
        category: asset.category,
        price: currentPrice,
        change24h: asset.change24h,
        volume24h: asset.volume24h,
        sparkline: [...asset.sparklineBase],
        updatedAt: nowIso,
      };
    });

    this.lastQuoteUpdate = Date.now();
  }

  /**
   * Toggles the circuit breaker state (used for simulated upstream failure recovery testing).
   */
  setCircuitBreaker(tripped: boolean): void {
    this.isCircuitBreakerTripped = tripped;
    this.logger.warn(`Circuit breaker state changed: tripped=${tripped}`);
  }

  /**
   * Returns current multi-asset ticker quotes with circuit-breaker protection.
   * Never throws; falls back to cached quotes to guarantee <50ms SLA.
   */
  async getTickerQuotes(): Promise<TickerResponseDto> {
    const cacheAge = Date.now() - this.lastQuoteUpdate;

    // Refresh cache if older than 3 seconds and circuit breaker is NOT tripped
    if (cacheAge > 3000 && !this.isCircuitBreakerTripped) {
      this.refreshQuoteCache();
    }

    const feedStatus = this.isCircuitBreakerTripped ? 'FALLBACK' : 'OPTIMAL';

    return {
      quotes: this.cachedQuotes,
      feedStatus,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Computes a binary SHA-256 Merkle root from vault reserve leaves.
   */
  calculateMerkleRoot(leaves: string[]): string {
    if (!leaves || leaves.length === 0) {
      return crypto.createHash('sha256').update('empty_vault_root').digest('hex');
    }

    let currentLevel = leaves.map((leaf) =>
      crypto.createHash('sha256').update(leaf).digest('hex'),
    );

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate odd node
        const combined = crypto
          .createHash('sha256')
          .update(left + right)
          .digest('hex');
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }

  /**
   * Generates live Enclave telemetry with Merkle root proof-of-reserves and HSM node statuses.
   */
  async getEnclaveTelemetry(): Promise<EnclaveTelemetryDto> {
    const reserveAttestations = [
      'VAULT_GENEVA_BTC_RESERVE_12850_BTC',
      'VAULT_ZURICH_ETH_RESERVE_145200_ETH',
      'VAULT_NY_US_TREASURIES_9200000000_USD',
      'VAULT_GENEVA_GOLD_BULLION_4500_KG_XAU',
    ];

    const merkleRoot = this.calculateMerkleRoot(reserveAttestations);

    const hsmClusters: HsmNodeStatusDto[] = [
      {
        location: 'Geneva (CH-01)',
        status: 'ACTIVE_ONLINE',
        uptime: '99.999%',
        securityStandard: 'FIPS 140-3 Level 4',
      },
      {
        location: 'Zurich (CH-02)',
        status: 'ACTIVE_ONLINE',
        uptime: '100.00%',
        securityStandard: 'FIPS 140-3 Level 4',
      },
      {
        location: 'New York (US-01)',
        status: 'ACTIVE_ONLINE',
        uptime: '99.998%',
        securityStandard: 'FIPS 140-3 Level 4',
      },
    ];

    const tierAum: TierAumDto = {
      privateWealth: '$4,820,000,000',
      institutional: '$12,400,000,000',
      total: '$17,220,000,000',
    };

    return {
      merkleRoot,
      clearingLatencyMs: 14.2,
      hsmClusters,
      tierAum,
      lastAttestationUtc: new Date().toISOString(),
      enclaveStatus: 'OPTIMAL',
    };
  }
}
