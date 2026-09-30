import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const FIELD_ENCRYPTION_KEY = Buffer.from(
  (process.env.FIELD_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
    .padEnd(64, '0')
    .slice(0, 64),
  'hex'
);

const HMAC_SECRET = process.env.JWT_SECRET || 'wavy_admin_jwt_access_super_secret_Supreme_enclave_2026';

function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', FIELD_ENCRYPTION_KEY, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
}

function hashBlindIndex(value: string): string {
  const normalized = value.toLowerCase().trim();
  return crypto.createHmac('sha256', HMAC_SECRET).update(normalized).digest('hex');
}

async function main() {
  console.log('Seeding WavyAssets Institutional Admin Database...');

  const defaultPassword = 'Supreme2026!#Vault';
  const passphraseHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 1. Seed 5 Institutional Admin Operators
  const operators = [
    {
      id: 'op-treasury_officer-01',
      email: 'e.vance@wavyassets.ch',
      fullName: 'Eleanor Vance',
      role: 'TREASURY_OFFICER',
    },
    {
      id: 'op-super_admin-01',
      email: 'a.wright@wavyassets.ch',
      fullName: 'Alexander Wright',
      role: 'SUPER_ADMIN',
    },
    {
      id: 'op-compliance_officer-01',
      email: 'm.thorne@wavyassets.ch',
      fullName: 'Marcella Thorne',
      role: 'COMPLIANCE_OFFICER',
    },
    {
      id: 'op-concierge-01',
      email: 'j.delacroix@wavyassets.ch',
      fullName: 'Julian Delacroix',
      role: 'CONCIERGE',
    },
    {
      id: 'op-desk_lead-01',
      email: 's.lindqvist@wavyassets.ch',
      fullName: 'Soren Lindqvist',
      role: 'DESK_LEAD',
    },
  ];

  for (const op of operators) {
    await prisma.adminUser.upsert({
      where: { email: op.email },
      update: {
        fullName: op.fullName,
        role: op.role,
        passphraseHash,
        isActive: true,
      },
      create: {
        id: op.id,
        email: op.email,
        fullName: op.fullName,
        role: op.role,
        passphraseHash,
        isActive: true,
      },
    });
  }

  // Seed Super Admin: Moses Alladin
  const mosesPassphraseHash = await argon2.hash('MosesAlladin1@', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.adminUser.upsert({
    where: { email: 'support@wavyassets.com' },
    update: {
      fullName: 'Moses Alladin',
      role: 'SUPER_ADMIN',
      passphraseHash: mosesPassphraseHash,
      isActive: true,
    },
    create: {
      email: 'support@wavyassets.com',
      fullName: 'Moses Alladin',
      role: 'SUPER_ADMIN',
      passphraseHash: mosesPassphraseHash,
      isActive: true,
    },
  });

  console.log(`Seeded ${operators.length + 1} administrative operators (including Moses Alladin).`);

  // 2. Seed Fiat Deposit Rail Configuration
  await prisma.fiatDepositRailConfig.upsert({
    where: { id: 'GLOBAL_FIAT_RAIL' },
    update: {
      beneficiaryName: 'WavyAssets Supreme Custody AG',
      swissIban: 'CH93 0023 8812 4019 8821 0',
      bicSwift: 'UBSWCHZH80A',
      clearingRail: 'Swiss SIC RTGS / Fedwire DvP',
      memoFormat: 'WY-{USER_REF}-TREASURY-03',
      updatedBy: 'op-super_admin-01',
    },
    create: {
      id: 'GLOBAL_FIAT_RAIL',
      beneficiaryName: 'WavyAssets Supreme Custody AG',
      swissIban: 'CH93 0023 8812 4019 8821 0',
      bicSwift: 'UBSWCHZH80A',
      clearingRail: 'Swiss SIC RTGS / Fedwire DvP',
      memoFormat: 'WY-{USER_REF}-TREASURY-03',
      updatedBy: 'op-super_admin-01',
    },
  });
  console.log('Seeded Fiat Deposit Rail Configuration.');

  // 3. Seed Crypto Deposit Rails
  const cryptoRails = [
    { asset: 'USDC', network: 'ERC-20', vaultAddress: '0x94A8D19F200c9261a81eC97669d0339dE78E916B' },
    { asset: 'USDT', network: 'TRC-20', vaultAddress: 'TYDjh82Nq9s8xZ1v5B8vK2L8wX4Q9p1Z8wX' },
    { asset: 'BTC', network: 'Bitcoin Native', vaultAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
    { asset: 'ETH', network: 'ERC-20', vaultAddress: '0x3B88e63a15cDFF7a6B9E934c1F3A229D29Eb8bFE' },
  ];

  for (const rail of cryptoRails) {
    await prisma.cryptoDepositRailConfig.upsert({
      where: { asset_network: { asset: rail.asset, network: rail.network } },
      update: { vaultAddress: rail.vaultAddress, isActive: true },
      create: {
        asset: rail.asset,
        network: rail.network,
        vaultAddress: rail.vaultAddress,
        minDepositUsd: 500.0,
        confirmations: 3,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${cryptoRails.length} crypto rails.`);

  // 4. Seed Lead Inquiries with AES-256-GCM Encryption
  const sampleLeads = [
    {
      fullName: 'Lars Von Essen',
      email: 'l.essen@nordic-Supreme.se',
      company: 'Nordic Supreme Fund',
      telegram: '@nordic_lars',
      service: 'AI_FUNDS',
      allocation: '$10M+',
      score: 98.0,
      status: 'NEW',
      notes: 'Initial mandate submission via landing page terminal.',
      location: 'Stockholm, Sweden',
    },
    {
      fullName: 'Klaus Reinhardt',
      email: 'klaus@zurich-private-cap.ch',
      company: 'Zurich Private Capital',
      telegram: '@klaus_zpc',
      service: 'REAL_ESTATE',
      allocation: '$5M - $10M',
      score: 94.0,
      status: 'IN_REVIEW',
      notes: 'Interested in commercial SPVs and FreePort vaults.',
      location: 'Zurich, Switzerland',
    },
    {
      fullName: 'Elena Rostova',
      email: 'erostova@geneva-alpha.ch',
      company: 'Geneva Alpha Management',
      telegram: '@elena_alpha',
      service: 'VIP_CARDS',
      allocation: '$25M+',
      score: 96.0,
      status: 'MANDATE_SENT',
      notes: 'Obsidian metal card eligibility confirmed. Awaiting mandate signature.',
      location: 'Geneva, Switzerland',
    },
    {
      fullName: 'Oliver Sinclair',
      email: 'o.sinclair@mayfair-family.co.uk',
      company: 'Mayfair Family Office',
      telegram: '@sinclair_mfo',
      service: 'CRYPTO',
      allocation: '$10M+',
      score: 91.0,
      status: 'NEW',
      notes: 'Requests MPC vault cold-storage separation documentation.',
      location: 'London, United Kingdom',
    },
    {
      fullName: 'Jean-Paul Marat',
      email: 'marat@rothschild-alliance.fr',
      company: 'Alliance Privee',
      telegram: '@jp_marat',
      service: 'CARS',
      allocation: '$5M - $10M',
      score: 88.0,
      status: 'ARCHIVED',
      notes: 'Mandate concluded. Client transitioned to private client desk.',
      location: 'Paris, France',
    },
  ];

  for (const lead of sampleLeads) {
    const emailHash = hashBlindIndex(lead.email);
    const existing = await prisma.leadInquiry.findFirst({
      where: { workEmailHash: emailHash },
    });

    if (!existing) {
      await prisma.leadInquiry.create({
        data: {
          fullNameEncrypted: encryptField(lead.fullName),
          workEmailEncrypted: encryptField(lead.email),
          workEmailHash: emailHash,
          companyName: lead.company,
          telegramEncrypted: encryptField(lead.telegram),
          service: lead.service,
          allocationRange: lead.allocation,
          domainScore: lead.score,
          status: lead.status,
          notes: lead.notes,
          location: lead.location,
          isSpam: false,
          crmDispatched: false,
        },
      });
    }
  }
  console.log(`Seeded ${sampleLeads.length} encrypted lead inquiries.`);

  // 5. Seed Core Supreme Users & Ledger Accounts
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@wavyassets.ch' },
    update: {},
    create: {
      id: 'usr-institutional-001',
      email: 'client@wavyassets.ch',
      fullName: 'Aethelgard Capital LP',
      passphraseHash,
      tier: 'INSTITUTIONAL',
      kycTier: 'TIER_3',
      isActive: true,
    },
  });

  // Seed Ledger Accounts for Metrics ($142.8M Total Vault Balance)
  await prisma.ledgerAccount.upsert({
    where: {
      userId_accountType_currency: {
        userId: clientUser.id,
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
      },
    },
    update: { balance: 28450110.50 },
    create: {
      userId: clientUser.id,
      accountType: 'AVAILABLE_CASH',
      currency: 'USD',
      balance: 28450110.50,
    },
  });

  await prisma.ledgerAccount.upsert({
    where: {
      userId_accountType_currency: {
        userId: clientUser.id,
        accountType: 'INVESTED_CAPITAL',
        currency: 'USD',
      },
    },
    update: { balance: 114440309.50 },
    create: {
      userId: clientUser.id,
      accountType: 'INVESTED_CAPITAL',
      currency: 'USD',
      balance: 114440309.50,
    },
  });

  // 6. Seed Settlement Ledger Transactions
  const sampleTxs = [
    {
      referenceId: 'TX-SIC-89210-SETTLED',
      type: 'DEPOSIT',
      status: 'SETTLED',
      description: 'Swiss SIC RTGS Wire Settlement - UBS Zurich',
      amount: 5200000.0,
      currency: 'USD',
      rail: 'SWISS_SIC',
      counterparty: 'UBS AG Zurich Enclave',
      accountNumber: 'CH93 0023 8812 4019 8821 0',
    },
    {
      referenceId: 'TX-MPC-USDC-4819',
      type: 'DEPOSIT',
      status: 'SETTLED',
      description: 'Institutional MPC Vault Inbound Clearance',
      amount: 2500000.0,
      currency: 'USDC',
      rail: 'ETH',
      counterparty: '0x94A8...916B Fireblocks Vault',
      accountNumber: 'ERC-20 Inbound',
    },
    {
      referenceId: 'TX-PENDING-WIRE-01',
      type: 'DEPOSIT',
      status: 'PENDING',
      description: 'Pending Wire - Pictet & Cie DvP Transfer',
      amount: 1500000.0,
      currency: 'USD',
      rail: 'SWISS_SIC',
      counterparty: 'Banque Pictet & Cie SA',
      accountNumber: 'CH44 0078 1290 4410 9901 2',
    },
    {
      referenceId: 'TX-PENDING-WIRE-02',
      type: 'DEPOSIT',
      status: 'PENDING',
      description: 'Pending Wire - Lombard Odier Escrow Settlement',
      amount: 750000.0,
      currency: 'USD',
      rail: 'SWISS_SIC',
      counterparty: 'Lombard Odier & Cie',
      accountNumber: 'CH12 0089 9921 5510 1204 8',
    },
    {
      referenceId: 'TX-PENDING-WITHDRAWAL-HIGH',
      type: 'WITHDRAWAL',
      status: 'PENDING',
      description: 'Capital Distribution - Credit Suisse Private Wealth',
      amount: 450000.0,
      currency: 'USD',
      rail: 'SWISS_SIC',
      counterparty: 'Credit Suisse Zurich',
      accountNumber: 'CH56 0021 3410 8892 1102 4',
    },
    {
      referenceId: 'TX-PENDING-WITHDRAWAL-HIGH-2',
      type: 'WITHDRAWAL',
      status: 'PENDING_SECOND_SIGN_OFF',
      description: 'Outbound Liquidity Rebalancing - LGT Bank Liechtenstein',
      amount: 220000.0,
      currency: 'USD',
      rail: 'SWISS_SIC',
      counterparty: 'LGT Bank AG',
      accountNumber: 'LI92 0882 1009 8812 0019 1',
    },
  ];

  for (const tx of sampleTxs) {
    await prisma.ledgerTransaction.upsert({
      where: { referenceId: tx.referenceId },
      update: {
        status: tx.status,
        amount: tx.amount,
      },
      create: {
        referenceId: tx.referenceId,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        amount: tx.amount,
        currency: tx.currency,
        rail: tx.rail,
        counterparty: tx.counterparty,
        accountNumber: tx.accountNumber,
      },
    });
  }

  // Seed sample KYC Documents for Compliance Queue
  const kycDocs = [
    {
      userId: clientUser.id,
      docType: 'ARTICLES_OF_INC',
      fileUrl: '/api/v1/compliance/dossiers/doc-incorp-01.pdf',
      isVerified: false,
    },
    {
      userId: clientUser.id,
      docType: 'PASSPORT',
      fileUrl: '/api/v1/compliance/dossiers/doc-passport-01.pdf',
      isVerified: false,
    },
  ];

  for (const doc of kycDocs) {
    const existingDoc = await prisma.kycDocument.findFirst({
      where: { userId: doc.userId, docType: doc.docType },
    });
    if (!existingDoc) {
      await prisma.kycDocument.create({
        data: doc,
      });
    }
  }

  // 7. Seed Additional Supreme Clients for User Directory & Compliance
  const additionalClients = [
    {
      id: 'usr-wealth-002',
      email: 'b.vonberg@zurich-private.ch',
      fullName: 'Baroness Beatrice von Berg',
      tier: 'PRIVATE_WEALTH',
      kycTier: 'TIER_2',
      isActive: true,
      cash: 8450200.0,
      invested: 12500000.0,
      cardLast4: '8821',
      cardTier: 'OBSIDIAN',
      docs: [
        { docType: 'PASSPORT', fileUrl: '/api/v1/compliance/dossiers/vonberg-passport.pdf', isVerified: true },
        { docType: 'TAX_AFFIDAVIT', fileUrl: '/api/v1/compliance/dossiers/vonberg-tax.pdf', isVerified: false },
      ],
    },
    {
      id: 'usr-wealth-003',
      email: 'c.castiglione@geneva-trust.ch',
      fullName: 'Carlo Castiglione',
      tier: 'INSTITUTIONAL',
      kycTier: 'TIER_3',
      isActive: true,
      cash: 4200000.0,
      invested: 18000000.0,
      cardLast4: '4410',
      cardTier: 'BLACK',
      docs: [
        { docType: 'ARTICLES_OF_INC', fileUrl: '/api/v1/compliance/dossiers/castiglione-spv.pdf', isVerified: true },
      ],
    },
    {
      id: 'usr-retail-004',
      email: 'hans.weber@basel-biotech.ch',
      fullName: 'Dr. Hans Weber',
      tier: 'RETAIL',
      kycTier: 'TIER_1',
      isActive: true,
      cash: 450000.0,
      invested: 800000.0,
      cardLast4: null,
      cardTier: null,
      docs: [
        { docType: 'PASSPORT', fileUrl: '/api/v1/compliance/dossiers/weber-passport.pdf', isVerified: false },
      ],
    },
    {
      id: 'usr-locked-005',
      email: 'viktor.petrov@alpen-holdings.li',
      fullName: 'Viktor Petrov',
      tier: 'PRIVATE_WEALTH',
      kycTier: 'TIER_2',
      isActive: false, // Suspended / Locked
      cash: 2100000.0,
      invested: 5400000.0,
      cardLast4: '1904',
      cardTier: 'OBSIDIAN',
      docs: [
        { docType: 'PASSPORT', fileUrl: '/api/v1/compliance/dossiers/petrov-passport.pdf', isVerified: false },
      ],
    },
  ];

  for (const client of additionalClients) {
    const user = await prisma.user.upsert({
      where: { email: client.email },
      update: {
        fullName: client.fullName,
        tier: client.tier,
        kycTier: client.kycTier,
        isActive: client.isActive,
      },
      create: {
        id: client.id,
        email: client.email,
        fullName: client.fullName,
        passphraseHash,
        tier: client.tier,
        kycTier: client.kycTier,
        isActive: client.isActive,
      },
    });

    await prisma.ledgerAccount.upsert({
      where: {
        userId_accountType_currency: {
          userId: user.id,
          accountType: 'AVAILABLE_CASH',
          currency: 'USD',
        },
      },
      update: { balance: client.cash },
      create: {
        userId: user.id,
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: client.cash,
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
      update: { balance: client.invested },
      create: {
        userId: user.id,
        accountType: 'INVESTED_CAPITAL',
        currency: 'USD',
        balance: client.invested,
      },
    });

    if (client.cardLast4) {
      await prisma.vipCard.upsert({
        where: { userId: user.id },
        update: {
          cardNumberLast4: client.cardLast4,
          tier: client.cardTier || 'OBSIDIAN',
        },
        create: {
          userId: user.id,
          cardNumberLast4: client.cardLast4,
          tier: client.cardTier || 'OBSIDIAN',
          dailySpendLimit: 50000.0,
          pinEncrypted: encryptField('1234'),
          shippingStatus: 'DELIVERED',
        },
      });
    }

    for (const doc of client.docs) {
      const existingDoc = await prisma.kycDocument.findFirst({
        where: { userId: user.id, docType: doc.docType },
      });
      if (!existingDoc) {
        await prisma.kycDocument.create({
          data: {
            userId: user.id,
            docType: doc.docType,
            fileUrl: doc.fileUrl,
            isVerified: doc.isVerified,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
