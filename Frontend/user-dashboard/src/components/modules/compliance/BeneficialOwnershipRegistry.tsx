import React, { useState } from 'react';
import {
  Building2,
  Key,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Clock,
  X,
} from 'lucide-react';
import {
  CORPORATE_ENTITY_PROFILE,
  BENEFICIAL_SIGNERS,
  VERIFIED_CREDENTIALS,
} from '../../../lib/governanceAssetData';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

export const BeneficialOwnershipRegistry: React.FC = () => {
  const {
    isUploadDossierModalOpen,
    openUploadDossierModal,
    closeUploadDossierModal,
    uploadedDossierFiles,
    simulateUploadDossier,
  } = useGovernanceStore();

  const [dossierName, setDossierName] = useState('');

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossierName.trim()) return;
    simulateUploadDossier(dossierName.trim());
    setDossierName('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left Column: Corporate Beneficial Ownership (7 Cols) */}
      <div
        data-testid="ubo-registry-panel"
        className="xl:col-span-7 bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-hairline">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-primary" />
            <div>
              <span className="font-mono text-[10px] text-outline uppercase tracking-widest block">
                Beneficial Ownership (UBO) Registry
              </span>
              <h2 className="font-serif text-sm font-semibold text-on-surface">
                {CORPORATE_ENTITY_PROFILE.legalName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="px-2 py-0.5 bg-surface-container text-outline rounded-DEFAULT">
              UID: {CORPORATE_ENTITY_PROFILE.uidJurisdiction}
            </span>
          </div>
        </div>

        {/* Corporate Plate Grid */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <span className="text-[10px] text-outline uppercase block">Entity Structure</span>
            <span className="font-bold text-on-surface mt-0.5 block">
              {CORPORATE_ENTITY_PROFILE.entityStructure}
            </span>
            <span className="text-[10px] text-outline">{CORPORATE_ENTITY_PROFILE.spvType}</span>
          </div>

          <div>
            <span className="text-[10px] text-outline uppercase block">Fiduciary Trustee</span>
            <span className="font-bold text-on-surface mt-0.5 block">
              {CORPORATE_ENTITY_PROFILE.trustee}
            </span>
            <span className="text-[10px] text-tertiary">{CORPORATE_ENTITY_PROFILE.trusteeReg}</span>
          </div>

          <div>
            <span className="text-[10px] text-outline uppercase block">Execution Quorum</span>
            <span className="font-bold text-primary mt-0.5 block">
              {CORPORATE_ENTITY_PROFILE.quorum}
            </span>
            <span className="text-[10px] text-outline">{CORPORATE_ENTITY_PROFILE.quorumDesc}</span>
          </div>
        </div>

        {/* Verified Signers & UBO Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-outline uppercase tracking-wider font-semibold">
              Verified Ultimate Beneficial Owners & Key Signers
            </span>
            <span className="text-tertiary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              All 3 Keys Attested
            </span>
          </div>

          <div className="space-y-2">
            {BENEFICIAL_SIGNERS.map((signer, idx) => (
              <div
                key={idx}
                className="p-3 bg-surface-container-low rounded-DEFAULT border border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container transition-colors font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                    {signer.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs font-semibold text-on-surface">
                        {signer.name}
                      </span>
                      {signer.ownershipPct && (
                        <span className="px-1.5 py-0.2 bg-primary/15 text-primary text-[10px] font-bold rounded-DEFAULT">
                          UBO {signer.ownershipPct}%
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-outline block mt-0.5 font-sans">
                      {signer.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <span
                      className={`text-[10px] font-bold block ${
                        signer.isArmed ? 'text-tertiary' : 'text-outline'
                      }`}
                    >
                      {signer.keyStatus}
                    </span>
                    <span className="text-[10px] text-outline">{signer.keyIndex}</span>
                  </div>
                  <Key
                    className={`w-4 h-4 ${
                      signer.isArmed ? 'text-tertiary' : 'text-outline'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Credentials Archive & Fiduciary Maintenance (5 Cols) */}
      <div className="xl:col-span-5 flex flex-col gap-4">
        {/* Scheduled Fiduciary Maintenance Banner */}
        <div
          data-testid="fiduciary-maintenance-banner"
          className="bg-surface-container-low border border-border-hairline rounded-DEFAULT p-4 space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-secondary font-bold uppercase tracking-wider">
                  Scheduled Fiduciary Maintenance
                </span>
                <span className="px-1.5 py-0.2 bg-secondary/15 text-secondary rounded-DEFAULT">
                  In 45 Days
                </span>
              </div>
              <h3 className="font-serif text-sm font-semibold text-on-surface">
                Annual Source of Wealth Refresh due May 18, 2025
              </h3>
              <p className="font-sans text-xs text-outline leading-relaxed">
                Periodic Swiss private banking due diligence renewal for consolidated portfolio NAV ($14.82M across services). Pre-filled affidavit prepared by Treuhand Zurich.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 font-mono text-xs">
            <button
              type="button"
              data-testid="upload-audit-dossier-btn"
              onClick={openUploadDossierModal}
              className="px-3 py-1.5 bg-primary text-surface hover:bg-primary-hover font-bold uppercase rounded-DEFAULT transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Audit Dossier</span>
            </button>
          </div>
        </div>

        {/* Verified Credentials Archive */}
        <div
          data-testid="verified-credentials-deck"
          className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-4 space-y-3 flex-1"
        >
          <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tertiary" />
              <h3 className="font-serif text-xs font-semibold uppercase text-on-surface">
                Verified Credentials Archive
              </h3>
            </div>
            <span className="font-mono text-[10px] text-outline">4 of 4 Clear</span>
          </div>

          <div className="space-y-2">
            {VERIFIED_CREDENTIALS.map((cred) => (
              <div
                key={cred.id}
                className="p-2.5 bg-surface-container-low rounded-DEFAULT border border-border-hairline flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
                  <div>
                    <span className="font-sans text-xs font-medium text-on-surface block">
                      {cred.title}
                    </span>
                    <span className="font-mono text-[10px] text-outline block">
                      {cred.authority}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.2 bg-tertiary/15 text-tertiary font-mono text-[10px] font-bold rounded-DEFAULT shrink-0">
                  {cred.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Dossier Modal */}
      {isUploadDossierModalOpen && (
        <div
          data-testid="upload-dossier-modal"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-surface-container-low border border-border-hairline rounded-DEFAULT max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <h3 className="font-serif text-sm font-semibold uppercase text-on-surface">
                  Upload Fiduciary Audit Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={closeUploadDossierModal}
                className="text-outline hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-outline uppercase block mb-1">
                  Document Reference Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zurich_Source_of_Wealth_2025.pdf"
                  value={dossierName}
                  onChange={(e) => setDossierName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-2 text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="text-[11px] font-sans text-outline">
                Uploaded dossiers are cryptographically notarized with sha256 checksums and deposited into the Swiss FINMA Vault.
              </div>

              {uploadedDossierFiles.length > 0 && (
                <div className="p-2 bg-surface-container rounded-DEFAULT border border-border-hairline space-y-1">
                  <div className="text-[10px] uppercase text-outline">Recently Uploaded Files:</div>
                  {uploadedDossierFiles.map((f) => (
                    <div key={f} className="flex items-center gap-1 text-primary text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeUploadDossierModal}
                  className="px-3 py-1.5 bg-surface-container text-outline rounded-DEFAULT hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-surface font-bold uppercase rounded-DEFAULT hover:bg-primary-hover"
                >
                  Submit Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
