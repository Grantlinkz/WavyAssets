import type { TrustMode } from '../../store/useTerminalStore';
import avatarTariq from '../../assets/testimonials/tariq-alzahrani.jpg';
import avatarHendrik from '../../assets/testimonials/hendrik-weber.jpg';
import avatarEleanor from '../../assets/testimonials/eleanor-de-broglie.jpg';
import avatarKoenig from '../../assets/testimonials/alexander-koenig.jpg';
import avatarLaurent from '../../assets/testimonials/victoria-laurent.jpg';
import avatarThorne from '../../assets/testimonials/marcus-thorne.jpg';

export interface TrustMetricItem {
  id: string;
  label: string;
  badge: string;
  badgeType: 'emerald' | 'gold';
  value: string;
  subtitle: string;
  progressPercent: number;
  progressColor: 'primary' | 'secondary';
}

export const trustMetricsData: Record<TrustMode, TrustMetricItem[]> = {
  'private-wealth': [
    {
      id: 'aum',
      label: 'Cross-Asset AUM',
      badge: 'VERIFIED BY DELOITTE',
      badgeType: 'emerald',
      value: '$4.82B',
      subtitle: 'Audited Cumulative Assets',
      progressPercent: 84,
      progressColor: 'secondary',
    },
    {
      id: 'uptime',
      label: 'Custody Uptime',
      badge: 'SOC2 TYPE II CERTIFIED',
      badgeType: 'gold',
      value: '99.998%',
      subtitle: 'Hardware Enclave Availability',
      progressPercent: 99.9,
      progressColor: 'primary',
    },
    {
      id: 'reserves',
      label: 'Proof of Reserves',
      badge: 'REAL-TIME MERKLE PROOF',
      badgeType: 'emerald',
      value: '100%',
      subtitle: 'Hourly Merkle Leaf Attestation',
      progressPercent: 100,
      progressColor: 'secondary',
    },
    {
      id: 'breaches',
      label: 'Security Breaches',
      badge: "LLOYD'S UNDERWRITTEN",
      badgeType: 'gold',
      value: '0',
      subtitle: 'Since Inception (2018)',
      progressPercent: 100,
      progressColor: 'primary',
    },
  ],
  institutional: [
    {
      id: 'aum',
      label: 'Cross-Asset AUM',
      badge: 'VERIFIED BY DELOITTE',
      badgeType: 'emerald',
      value: '$12.40B',
      subtitle: 'Institutional & Sovereign Balance Sheets',
      progressPercent: 92,
      progressColor: 'secondary',
    },
    {
      id: 'uptime',
      label: 'Custody Uptime',
      badge: 'SOC2 TYPE II CERTIFIED',
      badgeType: 'gold',
      value: '99.999%',
      subtitle: 'FIPS 140-3 Enclave Zero-Downtime SLA',
      progressPercent: 100,
      progressColor: 'primary',
    },
    {
      id: 'reserves',
      label: 'Proof of Reserves',
      badge: 'REAL-TIME MERKLE PROOF',
      badgeType: 'emerald',
      value: '100%',
      subtitle: 'Sub-Minute Merkle Attestation',
      progressPercent: 100,
      progressColor: 'secondary',
    },
    {
      id: 'breaches',
      label: 'Security Breaches',
      badge: "LLOYD'S UNDERWRITTEN",
      badgeType: 'gold',
      value: '0',
      subtitle: 'Zero Incidents Since Inception (2018)',
      progressPercent: 100,
      progressColor: 'primary',
    },
  ],
};

export interface TestimonialItem {
  id: string;
  badge: string;
  badgeType: 'emerald' | 'gold';
  identifier: string;
  quote: string;
  initials: string;
  avatarUrl?: string;
  name: string;
  role: string;
  location: string;
  allocatedLabel: string;
  allocatedAmount: string;
}

export const testimonialsData: Record<TrustMode, TestimonialItem[]> = {
  'private-wealth': [
    {
      id: 'koenig',
      badge: '19.4% Blended APY (24-Mo)',
      badgeType: 'emerald',
      identifier: 'FO-ZUR-091',
      quote:
        '“WAVY solved what Swiss private banks could not: programmatic cross-collateralization between our Geneva Freeport hypercar allocations and tokenized Zurich real estate, yielding continuous liquidity without tax liquidation events.”',
      initials: 'AK',
      avatarUrl: avatarKoenig,
      name: 'Alexander Koenig',
      role: 'Principal, Koenig Family Office',
      location: 'Geneva & Zurich',
      allocatedLabel: 'Allocated',
      allocatedAmount: '$68M AUM',
    },
    {
      id: 'laurent',
      badge: 'Sub-0.05ms Execution',
      badgeType: 'gold',
      identifier: 'QUANT-LD4-118',
      quote:
        '“The deterministic FIX 4.4 routing to Equinix NY4 and clustered H100 compute syndication delivers institutional predictability. The hardware kill-switches and enclave multi-sig provide peace of mind for our systematic arbitrage strategies.”',
      initials: 'VL',
      avatarUrl: avatarLaurent,
      name: 'Victoria Laurent',
      role: 'MD, Octave Quant Syndicate',
      location: 'London & New York',
      allocatedLabel: 'Allocated',
      allocatedAmount: '$140M DMA',
    },
    {
      id: 'thorne',
      badge: '$42M Asset Treasury',
      badgeType: 'emerald',
      identifier: 'CORP-DXB-404',
      quote:
        '“Deploying operating capital through the pure titanium VIP concierge cards with instant credit lines collateralized by our crypto and bond reserves has eliminated traditional FX spreads across seven jurisdictions.”',
      initials: 'MT',
      avatarUrl: avatarThorne,
      name: 'Marcus Thorne',
      role: 'Founder & CIO, Thorne Capital',
      location: 'Singapore & Dubai',
      allocatedLabel: 'Allocated',
      allocatedAmount: '$42M Treas.',
    },
  ],
  institutional: [
    {
      id: 'al-zahrani',
      badge: 'Zero-Slippage DMA Block Execution',
      badgeType: 'emerald',
      identifier: 'SWF-AUH-770',
      quote:
        '“Managing liquidity across sovereign debt tranches, institutional GPU clusters, and tokenized commercial properties requires uncompromised deterministic settlement. WavyAssets enclave architecture sets the gold benchmark.”',
      initials: 'SZ',
      avatarUrl: avatarTariq,
      name: 'Sheikh Tariq Al-Zahrani',
      role: 'Chief Investment Officer, Sovereign Capital Authority',
      location: 'Abu Dhabi & Riyadh',
      allocatedLabel: 'Allocated',
      allocatedAmount: '$420M Reserve',
    },
    {
      id: 'weber',
      badge: 'Sub-0.02ms Co-location Wire',
      badgeType: 'gold',
      identifier: 'HFT-FRA-902',
      quote:
        '“The sub-0.02ms co-location connection inside Equinix Frankfurt and London LD4 direct into institutional dark pools provides the sub-millisecond liquidity routing mandatory for our high-frequency market-making models.”',
      initials: 'HW',
      avatarUrl: avatarHendrik,
      name: 'Dr. Hendrik Weber',
      role: 'Managing Director, Apex Systematic Quantitative Fund',
      location: 'Frankfurt & Zurich',
      allocatedLabel: 'Allocated',
      allocatedAmount: '$310M DMA',
    },
    {
      id: 'broglie',
      badge: 'FIPS 140-3 MPC Quorum Attestation',
      badgeType: 'emerald',
      identifier: 'MFO-GEN-501',
      quote:
        '“Our ultra-high-net-worth consortium requires multi-sig MPC custody that complies seamlessly with Swiss FINMA VQF regulations. The real-time hourly Merkle leaf audit and Lloyd’s insurance backing provide complete fiduciary assurance.”',
      initials: 'EB',
      avatarUrl: avatarEleanor,
      name: 'Eleanor de Broglie',
      role: 'Senior Partner, Consortium de Genève MFO',
      location: 'Geneva & Luxembourg',
      allocatedLabel: 'Allocated',
      allocatedAmount: '$850M Multi-Sig',
    },
  ],
};

export interface CustodyNode {
  id: string;
  name: string;
  role: string;
}

export const custodyNodes: CustodyNode[] = [
  { id: 'bny', name: 'BNY MELLON', role: 'Tri-Party Custody' },
  { id: 'state-street', name: 'STATE STREET', role: 'Fund Admin & NAV' },
  { id: 'lgt', name: 'LGT BANK SCHWEIZ', role: 'Swiss Segregated Vault' },
  { id: 'equinix', name: 'EQUINIX NY4 / LD4', role: 'DMA Cross-Connect' },
  { id: 'lloyds', name: "LLOYD'S OF LONDON", role: 'Specie Asset Insurance' },
  { id: 'dtcc', name: 'DTCC DIRECT', role: 'Real-Time Clearing' },
];
