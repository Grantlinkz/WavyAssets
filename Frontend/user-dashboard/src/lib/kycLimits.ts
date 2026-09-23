export type KycTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export const KYC_TIER_DAILY_LIMITS: Record<KycTier, number> = {
  TIER_1: 10000,
  TIER_2: 250000,
  TIER_3: Infinity,
} as const;

export interface KycWithdrawalCheckResult {
  allowed: boolean;
  limit: number;
  tierName: string;
  error?: string;
}

export function checkKycWithdrawalLimit(
  amount: number,
  kycTier: KycTier = 'TIER_1'
): KycWithdrawalCheckResult {
  const limit = KYC_TIER_DAILY_LIMITS[kycTier] ?? 10000;
  const tierName = kycTier === 'TIER_3' ? 'Level 3' : kycTier === 'TIER_2' ? 'Level 2' : 'Level 1';

  if (amount > limit) {
    return {
      allowed: false,
      limit,
      tierName,
      error: `You have gone beyond your Tier daily limit ($${limit.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} USD for ${tierName}). Please upgrade your Tier.`,
    };
  }

  return {
    allowed: true,
    limit,
    tierName,
  };
}
