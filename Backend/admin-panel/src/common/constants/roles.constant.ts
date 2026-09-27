export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TREASURY_OFFICER = 'TREASURY_OFFICER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  CONCIERGE = 'CONCIERGE',
  DESK_LEAD = 'DESK_LEAD',
}

export type AdminPermission =
  | 'canFreezePlatform'
  | 'canApproveDualSignOff'
  | 'canCreditDeposit'
  | 'canElevateTier'
  | 'canDirectFund'
  | 'canSuspendUser'
  | 'canManageDepositRails'
  | 'canMintVipCards'
  | 'canConvertLeads';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: [
    'canFreezePlatform',
    'canApproveDualSignOff',
    'canCreditDeposit',
    'canElevateTier',
    'canDirectFund',
    'canSuspendUser',
    'canManageDepositRails',
    'canMintVipCards',
    'canConvertLeads',
  ],
  [AdminRole.TREASURY_OFFICER]: [
    'canApproveDualSignOff',
    'canCreditDeposit',
    'canDirectFund',
    'canManageDepositRails',
  ],
  [AdminRole.COMPLIANCE_OFFICER]: [
    'canElevateTier',
    'canSuspendUser',
  ],
  [AdminRole.CONCIERGE]: [
    'canMintVipCards',
    'canConvertLeads',
  ],
  [AdminRole.DESK_LEAD]: [
    'canConvertLeads',
  ],
};
