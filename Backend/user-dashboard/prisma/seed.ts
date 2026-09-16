import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashHmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

async function main() {
  console.log('Seeding WavyAssets Sovereign Institutional Dashboard...');

  // 1. Create Sovereign Test User
  const passphraseHash = await argon2.hash('SovereignPass123!#Institutional');
  const user = await prisma.user.upsert({
    where: { email: 'institutional@wavyassets.com' },
    update: {},
    create: {
      id: 'usr-sovereign-institutional-001',
      email: 'institutional@wavyassets.com',
      fullName: 'Dr. Alexander Von Berg',
      passphraseHash,
      tier: 'INSTITUTIONAL',
      kycTier: 'TIER_3',
      isCorporate: true,
      isActive: true,
    },
  });

  console.log(`Created Sovereign User: ${user.email} (${user.id})`);

  // 2. Create Active Session with a Known Handoff Ticket for Testing
  const handoffSecret =
    process.env.HANDOFF_TICKET_SECRET ||
    'wavy_sovereign_cross_domain_handoff_ticket_secret_key_2026';
  const rawHandoffTicket = 'wavy-test-handoff-ticket-valid-001';
  const handoffTicketHash = hashHmacSha256(rawHandoffTicket, handoffSecret);

  const refreshSecret =
    process.env.JWT_REFRESH_SECRET ||
    'wavy_dashboard_jwt_refresh_super_secret_institutional_key_2026';
  const rawRefreshToken = 'wavy-seed-refresh-token-001';
  const refreshTokenHash = hashHmacSha256(rawRefreshToken, refreshSecret);

  await prisma.session.upsert({
    where: { refreshTokenHash },
    update: { handoffTicketHash },
    create: {
      id: 'sess-institutional-seed-001',
      userId: user.id,
      refreshTokenHash,
      handoffTicketHash,
      ipAddress: '127.0.0.1',
      userAgent: 'WavyAssets Terminal / Mozilla 5.0',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Created Active Session with Test Ticket: [${rawHandoffTicket}]`);

  // 3. Create Double-Entry Ledger Accounts
  await prisma.ledgerAccount.upsert({
    where: {
      userId_accountType_currency: {
        userId: user.id,
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
      },
    },
    update: { balance: 1320450.0 },
    create: {
      userId: user.id,
      accountType: 'AVAILABLE_CASH',
      currency: 'USD',
      balance: 1320450.0,
    },
  });

  await prisma.ledgerAccount.upsert({
    where: {
      userId_accountType_currency: {
        userId: user.id,
        accountType: 'INVESTED_CAPITAL',
        currency: 'USD',
      },
    },
    update: { balance: 13500000.0 },
    create: {
      userId: user.id,
      accountType: 'INVESTED_CAPITAL',
      currency: 'USD',
      balance: 13500000.0,
    },
  });

  // 4. Create Whitelist Destination under 48-Hour Quarantine
  const quarantineDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await prisma.whitelistDestination.upsert({
    where: { id: 'wl-dest-eth-vault-001' },
    update: {},
    create: {
      id: 'wl-dest-eth-vault-001',
      userId: user.id,
      assetRail: 'ETH',
      destinationLabel: 'Cold Storage Vault Zurich Primary',
      beneficiaryOrg: 'Wavy Custody Trust AG',
      addressOrIban: '0x71C83F67a6E7947119BCE8e58319E5fA697f2621',
      status: 'QUARANTINE',
      quarantineUntil: quarantineDate,
      signersRequired: 2,
      signersCompleted: 1,
    },
  });

  // 5. Create Sample Crypto Holdings
  await prisma.cryptoHolding.createMany({
    data: [
      {
        userId: user.id,
        symbol: 'BTC',
        custodyType: 'SOVEREIGN_VAULT',
        quantity: 35.5,
        avgBuyPrice: 62400.0,
        stakedAmount: 0.0,
        pendingReward: 0.0,
        apy: 0.0,
      },
      {
        userId: user.id,
        symbol: 'ETH',
        custodyType: 'STAKED',
        quantity: 450.0,
        avgBuyPrice: 2850.0,
        stakedAmount: 450.0,
        pendingReward: 6.85,
        apy: 5.4,
      },
    ],
  });

  // 6. Create Sample Real Estate Property & Shares
  const property = await prisma.realEstateProperty.create({
    data: {
      id: 'prop-zurich-prime-001',
      title: 'Zurich Prime Financial Commercial Center',
      region: 'SWITZERLAND',
      totalValuation: 45000000.0,
      totalTokens: 100000,
      tokenPriceUsd: 450.0,
      annualizedYield: 8.4,
      occupancyRate: 98.5,
      spvContractUrl: 'https://docs.wavyassets.com/spv/zurich-prime-001.pdf',
    },
  });

  await prisma.realEstateShare.create({
    data: {
      userId: user.id,
      propertyId: property.id,
      tokenCount: 4666,
    },
  });

  // 7. Create Sample Exotic Car & Share
  const car = await prisma.exoticCar.create({
    data: {
      id: 'car-ferrari-250gt-001',
      vin: '250GT-BERLINETTA-1961-0428',
      make: 'Ferrari',
      model: '250 GT SWB Berlinetta',
      year: 1961,
      vaultLocation: 'Geneva FreePort Bonded Vault',
      insuredValue: 8500000.0,
      hagertyIndex: 142.8,
    },
  });

  await prisma.carShare.create({
    data: {
      userId: user.id,
      carId: car.id,
      sharePct: 14.12,
    },
  });

  // 8. Create VIP Obsidian Card
  await prisma.vipCard.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      cardNumberLast4: '8842',
      cardType: 'PHYSICAL',
      tier: 'BLACK',
      isFrozen: false,
      dailySpendLimit: 250000.0,
      cvvEncrypted: 'mock_aes256_cvv_encrypted_payload',
      pinEncrypted: 'mock_aes256_pin_encrypted_payload',
      shippingStatus: 'DELIVERED',
    },
  });

  console.log('Deterministic seeding successfully completed.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
