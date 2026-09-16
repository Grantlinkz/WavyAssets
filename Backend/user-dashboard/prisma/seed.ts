import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function hashHmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Database seeding is strictly forbidden in production environments.');
    process.exit(1);
  }

  console.log('Seeding WavyAssets Sovereign Institutional Dashboard for local development...');

  const handoffSecret =
    process.env.HANDOFF_TICKET_SECRET ||
    'wavy_sovereign_cross_domain_handoff_ticket_secret_key_2026';
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET ||
    'wavy_dashboard_jwt_refresh_super_secret_institutional_key_2026';

  // 1. Generate Non-Static Sovereign Test Credentials
  const seedPassphrase =
    process.env.SEED_USER_PASSPHRASE ||
    crypto.randomBytes(16).toString('hex') + '!Aa1';
  const passphraseHash = await argon2.hash(seedPassphrase);

  const rawHandoffTicket =
    process.env.SEED_HANDOFF_TICKET ||
    crypto.randomBytes(24).toString('hex');
  const handoffTicketHash = hashHmacSha256(rawHandoffTicket, handoffSecret);

  const rawRefreshToken =
    process.env.SEED_REFRESH_TOKEN ||
    crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = hashHmacSha256(rawRefreshToken, refreshSecret);

  const user = await prisma.user.upsert({
    where: { email: 'institutional@wavyassets.com' },
    update: { passphraseHash },
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

  // Redacted logging: never emit full credentials or raw tokens
  const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, (_g1, g2) => g2 + '***');
  console.log(`Created Sovereign User Profile: [${maskedEmail}] (id: ${user.id})`);

  // 2. Create Active Session with Hashed Tokens
  await prisma.session.upsert({
    where: { id: 'sess-institutional-seed-001' },
    update: {
      refreshTokenHash,
      handoffTicketHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
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

  console.log('Created Active Session with hashed handoff ticket (ID: sess-institutional-seed-001)');

  // In local development, write credentials securely to a gitignored .seed-credentials.local.json file
  const localCredsPath = path.resolve(__dirname, '../.seed-credentials.local.json');
  fs.writeFileSync(
    localCredsPath,
    JSON.stringify(
      {
        userId: user.id,
        email: user.email,
        passphrase: seedPassphrase,
        handoffTicket: rawHandoffTicket,
        refreshToken: rawRefreshToken,
        note: 'Local development credentials only. This file is gitignored.',
      },
      null,
      2,
    ),
  );

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
  await prisma.cryptoHolding.deleteMany({ where: { userId: user.id } });
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
  const property = await prisma.realEstateProperty.upsert({
    where: { id: 'prop-zurich-prime-001' },
    update: {},
    create: {
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

  await prisma.realEstateShare.deleteMany({ where: { userId: user.id } });
  await prisma.realEstateShare.create({
    data: {
      userId: user.id,
      propertyId: property.id,
      tokenCount: 4666,
    },
  });

  // 7. Create Sample Exotic Car & Share
  const car = await prisma.exoticCar.upsert({
    where: { vin: '250GT-BERLINETTA-1961-0428' },
    update: {},
    create: {
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

  await prisma.carShare.deleteMany({ where: { userId: user.id } });
  await prisma.carShare.create({
    data: {
      userId: user.id,
      carId: car.id,
      sharePct: 14.12,
    },
  });

  // 8. Create VIP Obsidian Card (without cvvEncrypted; CVVs are never persisted)
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
      pinEncrypted: 'mock_aes256_pin_encrypted_payload',
      shippingStatus: 'DELIVERED',
    } as any,
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
