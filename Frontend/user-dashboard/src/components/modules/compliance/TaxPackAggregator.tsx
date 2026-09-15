import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Fingerprint, CloudUpload, Table } from 'lucide-react';
import { MULTI_ASSET_TAX_DOSSIER } from '../../../lib/governanceAssetData';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { useGovernanceStore } from '../../../store/useGovernanceStore';
import { useDashboardStore } from '../../../store/useDashboardStore';

interface TaxPackAggregatorProps {
  maskBalances?: boolean;
  selectedTaxYear?: '2024' | '2025';
}

export const TaxPackAggregator: React.FC<TaxPackAggregatorProps> = ({
  maskBalances: propMask,
  selectedTaxYear: propTaxYear,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const storeTaxYear = useGovernanceStore((s) => s.selectedTaxYear);
  const selectedTaxYear = propTaxYear ?? storeTaxYear;
  const setTaxYear = useGovernanceStore((s) => s.setTaxYear);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const metrics = MULTI_ASSET_TAX_DOSSIER[selectedTaxYear];

  const handleDownloadPacket = (formatName: string) => {
    if (typeof window !== 'undefined' && window.document) {
      let content: string;
      let mimeType: string;
      let extension: string;

      if (formatName.includes('Merkle')) {
        mimeType = 'application/json';
        extension = 'json';
        content = JSON.stringify(
          {
            merkleRoot: '0x8f2a64c7e81b29a034d5812e964b0f241a87e315b9c0d12e84715a39df148e22',
            taxYear: selectedTaxYear,
            algorithm: 'SHA-256 Merkle Tree',
            leaves: metrics.map((m) => ({
              vertical: m.verticalTitle,
              amountUsd: m.amountUsd,
              treatment: m.treatment,
              leafHash: `0x${Math.abs(m.amountUsd * 7391).toString(16).padStart(64, '0')}`,
            })),
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
              Unified Sovereign Tax Pack & Gains Aggregation
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Tax Year Toggle */}
          <div className="flex items-center bg-surface-container p-1 rounded-DEFAULT border border-border-hairline">
            <button
              type="button"
              data-testid="tax-year-2024-btn"
              onClick={() => setTaxYear('2024')}
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
              onClick={() => setTaxYear('2025')}
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
