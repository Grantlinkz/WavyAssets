import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { KycTierChecklist } from './KycTierChecklist';
import { BeneficialOwnershipRegistry } from './BeneficialOwnershipRegistry';
import { TaxPackAggregator } from './TaxPackAggregator';
import { RegulatoryGatewayMatrix } from './RegulatoryGatewayMatrix';
import { useDashboardStore } from '../../../store/useDashboardStore';

interface ComplianceModuleProps {
  maskBalances?: boolean;
}

export const ComplianceModule: React.FC<ComplianceModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const handleDownloadAmlPack = () => {
    if (typeof window !== 'undefined' && window.document) {
      const csvContent =
        'data:text/csv;charset=utf-8,Document,Status,Jurisdiction,Notarization\nAMLA_Dossier_2025,Verified,Switzerland_FINMA,0x7c21...8b54\n';
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WavyAssets_AML_Compliance_Pack_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloadMsg('AML Compliance Pack downloaded.');
    setTimeout(() => setDownloadMsg(null), 3000);
  };

  return (
    <div
      data-testid="compliance-module"
      className="min-h-[540px] w-full space-y-6 select-none"
    >
      {/* 1. Header Ribbon & Enclave Attestation */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-outline tracking-wider uppercase">
            <span>Portfolio</span>
            <span>/</span>
            <span>Governance & Sovereign Attestation</span>
            <span>/</span>
            <span className="text-primary font-semibold">Compliance, KYC/AML & Tax Command</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <h1 className="font-serif text-xl font-bold text-on-surface tracking-tight">
              Institutional Compliance & Fiduciary Clearing
            </h1>
            <span className="px-2 py-0.5 bg-surface-container text-tertiary rounded-DEFAULT font-mono text-[10px] uppercase font-semibold flex items-center gap-1.5 border border-tertiary/30">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              Swiss FINMA Regulated Enclave // AMLA Art. 9 Compliant
            </span>
            <span className="px-2 py-0.5 bg-surface-container text-outline rounded-DEFAULT font-mono text-[10px] tabular-nums border border-border-hairline">
              HSM ATTESTATION: <span className="text-on-surface font-mono">0x7c21...8b54</span>
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            data-testid="download-aml-pack-btn"
            onClick={handleDownloadAmlPack}
            className="px-3 py-1.5 bg-primary text-surface hover:bg-primary-hover font-bold uppercase rounded-DEFAULT transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download AML Pack (PDF)</span>
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-2.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-xs rounded-DEFAULT flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* 2. Tiered KYC Status & Regulatory Telemetry */}
      <KycTierChecklist />

      {/* 3. Corporate UBO Registry & Credentials Archive */}
      <BeneficialOwnershipRegistry />

      {/* 4. Unified Sovereign Tax Pack Downloader */}
      <TaxPackAggregator maskBalances={maskBalances} />

      {/* 5. Global Regulatory Gateway Matrix */}
      <RegulatoryGatewayMatrix />
    </div>
  );
};
