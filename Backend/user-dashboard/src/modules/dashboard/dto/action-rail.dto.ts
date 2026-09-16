export interface ActionRailResponse {
  kycTier: string;
  dailyDepositLimit: string | number;
  dailyWithdrawalLimit: string | number;
  depositEligible: boolean;
  withdrawalEligible: boolean;
  quarantinedDestinationsCount: number;
  activeDestinationsCount: number;
  privacyMaskActive: boolean;
  requiresHardwareSignature: boolean;
}
