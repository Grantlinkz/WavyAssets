import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Fingerprint, CloudUpload, Table } from 'lucide-react';
import { MULTI_ASSET_TAX_DOSSIER } from '../../../lib/governanceAssetData';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { useGovernanceStore } from '../../../store/useGovernanceStore';
import { useDashboardStore } from '../../../store/useDashboardStore';

export interface TaxPackAggregatorProps {
  maskBalances?: boolean;
  selectedTaxYear?: '2024' | '2025';
  onSelectedTaxYearChange?: (year: '2024' | '2025') => void;
}

// Canonical SHA-256 implementation for deterministic client-side Merkle proof computation
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 300; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const s2 = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1h + ch + k[i] + s2) | 0;
      const s0h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0h + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

function computeMerkleTreeRoot(leafHashes: string[]): string {
  if (leafHashes.length === 0) return '0x' + '0'.repeat(64);
  let currentLevel = [...leafHashes];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push('0x' + sha256Sync(currentLevel[i] + currentLevel[i + 1]));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

export const TaxPackAggregator: React.FC<TaxPackAggregatorProps> = ({
  maskBalances: propMask,
  selectedTaxYear: propTaxYear,
  onSelectedTaxYearChange,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const storeTaxYear = useGovernanceStore((s) => s.selectedTaxYear);
  const selectedTaxYear = propTaxYear ?? storeTaxYear;
  const setTaxYear = useGovernanceStore((s) => s.setTaxYear);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleTaxYearChange = (year: '2024' | '2025') => {
    setTaxYear(year);
    onSelectedTaxYearChange?.(year);
  };

  const metrics = MULTI_ASSET_TAX_DOSSIER[selectedTaxYear];

  const handleDownloadPacket = (formatName: string) => {
    if (typeof window !== 'undefined' && window.document) {
      let content: string;
      let mimeType: string;
      let extension: string;

      if (formatName.includes('Merkle')) {
        mimeType = 'application/json';
        extension = 'json';

        const leaves = metrics.map((m) => {
          const canonicalData = `${m.verticalTitle}:${m.amountUsd}:${m.treatment}:${m.subMetricLabel}:${m.subMetricValue}`;
          const leafHash = '0x' + sha256Sync(canonicalData);
          return {
            vertical: m.verticalTitle,
            amountUsd: m.amountUsd,
            treatment: m.treatment,
            auditReference: `${m.subMetricLabel}: ${m.subMetricValue}`,
            leafHash,
          };
        });

        const computedRoot = computeMerkleTreeRoot(leaves.map((l) => l.leafHash));

        content = JSON.stringify(
          {
            environment: 'DEMONSTRATION // CANONICAL CLIENT COMPUTED PROOF',
            notice: 'Demonstration cryptographic proof calculated from canonical fiscal entries using SHA-256 Merkle tree',
            merkleRoot: computedRoot,
            taxYear: selectedTaxYear,
            algorithm: 'SHA-256 Merkle Tree',
            canonicalEncoding: 'verticalTitle:amountUsd:treatment:subMetricLabel:subMetricValue',
            leaves,
            generatedAt: new Date().toISOString(),
          },
          null,
          2
        );
      } else if (formatName.includes('Big 4') || formatName.includes('XML')) {
        mimeType = 'application/xml';
        extension = 'xml';
        content =
          `<?xml version="1.0" encoding="UTF-8"?>\n<TaxDossier taxYear="${selectedTaxYear}" generatedAt="${new Date().toISOString()}">\n` +
          metrics
            .map(
              (m) =>
                `  <Entry>\n    <Vertical>${m.verticalTitle}</Vertical>\n    <AmountUSD>${m.amountUsd}</AmountUSD>\n    <Treatment>${m.treatment}</Treatment>\n    <Reference>${m.subMetricLabel}: ${m.subMetricValue}</Reference>\n  </Entry>`
            )
            .join('\n') +
          '\n</TaxDossier>';
      } else {
        mimeType = 'text/csv';
        extension = 'csv';
        const headers = ['Vertical', 'Amount_USD', 'Tax_Treatment', 'Audit_Reference'];
        const rows = metrics.map((m) => [
          `"${m.verticalTitle}"`,
          m.amountUsd,
          `"${m.treatment}"`,
          `"${m.subMetricLabel}: ${m.subMetricValue}"`,
        ]);
        content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `WavyAssets_TaxPack_TY${selectedTaxYear}_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setDownloadMsg(`${formatName} generated and downloaded.`);
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  return (
    <div
      data-testid="tax-pack-aggregator-panel"
      className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-5 space-y-5"
    >
      {/* Header with Year Switcher & Download CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-outline uppercase tracking-widest">Multi-Asset Fiscal Dossier</span>
              <span className="px-1.5 py-0.2 bg-tertiary/10 text-tertiary font-bold rounded-DEFAULT">
                AUDITED LEDGER
              </span>
            </div>
            <h2 className="font-serif text-sm font-semibold text-on-surface">
              Unified Global Tax Pack & Gains Aggregation
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Tax Year Toggle */}
          <div className="flex items-center bg-surface-container p-1 rounded-DEFAULT border border-border-hairline">
            <button
              type="button"
              data-testid="tax-year-2024-btn"
              onClick={() => handleTaxYearChange('2024')}
              className={`px-2.5 py-1 rounded-DEFAULT font-bold transition-colors cursor-pointer ${
                selectedTaxYear === '2024'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              TY 2024 (Closed)
            </button>
            <button
              type="button"
              data-testid="tax-year-2025-btn"
              onClick={() => handleTaxYearChange('2025')}
              className={`px-2.5 py-1 rounded-DEFAULT font-bold transition-colors cursor-pointer ${
                selectedTaxYear === '2025'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              TY 2025 (Accruing)
            </button>
          </div>

          <button
            type="button"
            data-testid="download-tax-pack-btn"
            onClick={() => handleDownloadPacket('Complete Tax Packet')}
            className="px-3 py-1.5 bg-primary text-surface hover:bg-primary-hover font-bold uppercase rounded-DEFAULT transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download TY {selectedTaxYear} Pack</span>
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-2.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-xs rounded-DEFAULT flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* 5-Column Fiscal Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 font-mono">
        {metrics.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between gap-2"
          >
            <span className="text-[10px] text-outline uppercase tracking-wider block">
              {item.verticalTitle}
            </span>

            <div>
              <div className="text-lg font-bold text-on-surface tabular-nums">
                {formatMaskedCurrency(item.amountUsd, maskBalances)}
              </div>
              <span className="text-[11px] text-tertiary block mt-0.5 font-medium">
                {item.treatment}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-outline pt-2 border-t border-border-hairline">
              <span>{item.subMetricLabel}</span>
              <span className="text-on-surface font-semibold">{item.subMetricValue}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Software Integration Strip */}
      <div className="p-3.5 bg-surface-container-low rounded-DEFAULT border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-DEFAULT text-primary">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans text-xs font-semibold text-on-surface block">
              Direct Big 4 & Swiss Dr. Tax Integration
            </span>
            <span className="font-sans text-[11px] text-outline">
              Pre-formatted for Big 4 Tax Practice Suites (KPMG, PwC, EY, Deloitte) & Swiss Cantonal Forms.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="merkle-proof-btn"
            onClick={() => handleDownloadPacket('DLT Merkle Proof')}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-DEFAULT border border-border-hairline flex items-center gap-1.5 uppercase font-semibold"
          >
            <Fingerprint className="w-3.5 h-3.5 text-tertiary" />
            <span>Merkle Proof</span>
          </button>
          <button
            type="button"
            data-testid="big4-export-btn"
            onClick={() => handleDownloadPacket('Big 4 XML Export')}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-DEFAULT border border-border-hairline flex items-center gap-1.5 uppercase font-semibold"
          >
            <CloudUpload className="w-3.5 h-3.5 text-primary" />
            <span>Big 4 Export</span>
          </button>
          <button
            type="button"
            data-testid="form8949-csv-btn"
            onClick={() => handleDownloadPacket('Form 8949 CSV')}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-DEFAULT border border-border-hairline flex items-center gap-1.5 uppercase font-semibold"
          >
            <Table className="w-3.5 h-3.5 text-outline" />
            <span>Form 8949 CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
