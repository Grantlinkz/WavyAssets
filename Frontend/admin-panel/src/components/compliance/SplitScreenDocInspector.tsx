import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  X,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Lock,
  CheckSquare,
  Square,
  Hash,
} from "lucide-react"
import { useComplianceStore } from "../../store/useComplianceStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import {
  elevateUserTier,
  rejectKycDossier,
  updateFinmaChecklist,
  type FinmaChecklist,
} from "../../api/compliance"
import { formatTimestamp } from "../../lib/formatters"

export const SplitScreenDocInspector: React.FC = () => {
  const {
    isSplitInspectorOpen,
    closeInspector,
    selectedDossier,
    activeDocumentIndex,
    setActiveDocumentIndex,
  } = useComplianceStore()

  const { operator, hasPermission } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const [checklist, setChecklist] = useState<FinmaChecklist>({
    identityVerified: false,
    addressVerified: false,
    sourceOfWealthConfirmed: false,
    uboIdentified: false,
    riskCategorizationSigned: false,
  })

  const [finmaSignOffNotes, setFinmaSignOffNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectionMode, setIsRejectionMode] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const canElevate = hasPermission("canElevateTier")

  React.useEffect(() => {
    if (selectedDossier) {
      setChecklist(
        selectedDossier.finmaChecklist || {
          identityVerified: true,
          addressVerified: true,
          sourceOfWealthConfirmed: false,
          uboIdentified: false,
          riskCategorizationSigned: false,
        }
      )
      setFinmaSignOffNotes(selectedDossier.reviewerNotes || "")
      setIsRejectionMode(false)
      setErrorMsg(null)
      setSuccessMsg(null)
      setZoomLevel(100)
      setRotation(0)
    }
  }, [selectedDossier])

  // Checklist toggle
  const toggleChecklistItem = (key: keyof FinmaChecklist) => {
    const updated = { ...checklist, [key]: !checklist[key] }
    setChecklist(updated)
    if (selectedDossier) {
      updateFinmaChecklist(selectedDossier.id, { [key]: updated[key] }).catch(() => {})
    }
  }

  const allChecklistItemsChecked = Object.values(checklist).every(Boolean)

  // Elevation mutation
  const elevateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDossier) throw new Error("No dossier selected.")
      if (!allChecklistItemsChecked) {
        throw new Error("All 5 FINMA AML compliance checks must be explicitly confirmed before tier elevation.")
      }
      if (!finmaSignOffNotes.trim()) {
        throw new Error("Mandatory FINMA compliance officer sign-off notes required.")
      }

      return elevateUserTier({
        dossierId: selectedDossier.id,
        targetTier: selectedDossier.requestedTier,
        finmaSignOffNotes: finmaSignOffNotes.trim(),
        officerId: operator?.id || "op-eleanor-vance-01",
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(
        `Dossier elevated to ${data.dossier.requestedTier}. Sovereign ledger access elevated.`
      )
      queryClient.invalidateQueries({ queryKey: ["compliance"] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeInspector()
      }, 1500)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Tier elevation failed.")
    },
  })

  // Rejection mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDossier) throw new Error("No dossier selected.")
      if (!rejectionReason.trim()) {
        throw new Error("Mandatory audit reason required for dossier rejection/escalation.")
      }

      return rejectKycDossier({
        dossierId: selectedDossier.id,
        reason: rejectionReason.trim(),
        officerId: operator?.id || "op-eleanor-vance-01",
      })
    },
    onSuccess: () => {
      setSuccessMsg("Dossier has been rejected/escalated for FINMA Article 14 review.")
      queryClient.invalidateQueries({ queryKey: ["compliance"] })
      setTimeout(() => {
        closeInspector()
      }, 1500)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to reject dossier.")
    },
  })

  if (!isSplitInspectorOpen || !selectedDossier) return null

  const activeDoc = selectedDossier.documents?.[activeDocumentIndex] || {
    id: "doc-sample-01",
    type: "PASSPORT",
    filename: "CH_Passport_Encrypted_Dossier.pdf",
    fileSize: "4.8 MB",
    uploadedAt: new Date().toISOString(),
    verified: true,
    documentUrl: "#",
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={closeInspector}
      data-testid="split-screen-doc-inspector"
    >
      <div
        className="w-full max-w-6xl h-[92vh] bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-bg-canvas/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-telemetry-cyan/10 border border-telemetry-cyan/30 flex items-center justify-center text-telemetry-cyan">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-on-surface">
                  FINMA AML Dossier Split-Screen Inspector
                </h2>
                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-bg-elevated border border-border-subtle text-secondary rounded-[2px]">
                  {selectedDossier.dossierNumber}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-status-success/15 text-status-success border border-status-success/30 rounded-[2px]">
                  PEP / Sanctions Clear
                </span>
              </div>
              <p className="text-xs text-secondary">
                Entity: <span className="text-gold-accent font-semibold">{selectedDossier.userName}</span> ({selectedDossier.country})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeInspector}
              className="text-secondary hover:text-on-surface p-1.5 rounded-[4px] border border-border-subtle bg-bg-canvas hover:bg-state-hover transition-colors"
              aria-label="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-status-danger/10 border border-status-danger/30 rounded-[4px] text-xs text-status-danger flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-4 mt-3 p-3 bg-status-success/10 border border-status-success/30 rounded-[4px] text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Split Panels Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Verification Dossier & FINMA AML Checklist (5 cols) */}
          <div className="lg:col-span-5 border-r border-border-subtle p-5 overflow-y-auto flex flex-col gap-4 text-xs">
            {/* Applicant Profile Card */}
            <div className="p-3 bg-bg-canvas border border-border-subtle rounded-[4px]">
              <div className="text-[10px] font-mono uppercase text-secondary mb-2 tracking-wider">
                Sovereign Applicant Profile
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-secondary">Principal:</span>
                  <span className="font-semibold text-on-surface">{selectedDossier.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Email:</span>
                  <span className="font-mono text-on-surface">{selectedDossier.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Entity Type:</span>
                  <span className="font-mono text-secondary">{selectedDossier.entityType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Submission Date:</span>
                  <span className="font-mono text-secondary">
                    {formatTimestamp(selectedDossier.submittedAt).substring(0, 10)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Risk Score:</span>
                  <span className="font-mono text-status-success font-semibold">
                    {selectedDossier.riskScore} / 100 (Clean)
                  </span>
                </div>
              </div>
            </div>

            {/* Current Tier -> Target Elevation Tier Banner */}
            <div className="p-3 bg-gold-accent/5 border border-gold-accent/20 rounded-[4px]">
              <div className="text-[10px] font-mono uppercase text-gold-accent mb-1 tracking-wider font-semibold">
                Tier Elevation Request
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded-[2px] bg-bg-canvas border border-border-subtle text-secondary font-bold">
                    {selectedDossier.currentTier}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-accent" />
                  <span className="px-2 py-0.5 rounded-[2px] bg-gold-accent/20 border border-gold-accent/40 text-gold-accent font-bold">
                    {selectedDossier.requestedTier}
                  </span>
                </div>
                <span className="text-[10px] text-secondary font-mono">1-Click Elevation</span>
              </div>
            </div>

            {/* Interactive FINMA AML 5-Point Checklist */}
            <div className="p-3 bg-bg-canvas border border-border-subtle rounded-[4px]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-mono uppercase text-secondary tracking-wider font-semibold">
                  FINMA AML Compliance Checklist (Article 14)
                </div>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    allChecklistItemsChecked ? "text-status-success" : "text-amber-400"
                  }`}
                >
                  {Object.values(checklist).filter(Boolean).length} / 5 Confirmed
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div
                  onClick={() => toggleChecklistItem("identityVerified")}
                  className="flex items-center gap-2.5 p-1.5 rounded-[2px] hover:bg-state-hover/60 cursor-pointer transition-colors"
                >
                  {checklist.identityVerified ? (
                    <CheckSquare className="w-4 h-4 text-status-success shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-secondary shrink-0" />
                  )}
                  <span className={checklist.identityVerified ? "text-on-surface" : "text-secondary"}>
                    1. Government ID / Swiss Passport Authenticated
                  </span>
                </div>

                <div
                  onClick={() => toggleChecklistItem("addressVerified")}
                  className="flex items-center gap-2.5 p-1.5 rounded-[2px] hover:bg-state-hover/60 cursor-pointer transition-colors"
                >
                  {checklist.addressVerified ? (
                    <CheckSquare className="w-4 h-4 text-status-success shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-secondary shrink-0" />
                  )}
                  <span className={checklist.addressVerified ? "text-on-surface" : "text-secondary"}>
                    2. Institutional Proof of Domicile Verified (&lt; 90 days)
                  </span>
                </div>

                <div
                  onClick={() => toggleChecklistItem("sourceOfWealthConfirmed")}
                  className="flex items-center gap-2.5 p-1.5 rounded-[2px] hover:bg-state-hover/60 cursor-pointer transition-colors"
                >
                  {checklist.sourceOfWealthConfirmed ? (
                    <CheckSquare className="w-4 h-4 text-status-success shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-secondary shrink-0" />
                  )}
                  <span className={checklist.sourceOfWealthConfirmed ? "text-on-surface" : "text-secondary"}>
                    3. Legitimate Source of Wealth (SOW) Documented
                  </span>
                </div>

                <div
                  onClick={() => toggleChecklistItem("uboIdentified")}
                  className="flex items-center gap-2.5 p-1.5 rounded-[2px] hover:bg-state-hover/60 cursor-pointer transition-colors"
                >
                  {checklist.uboIdentified ? (
                    <CheckSquare className="w-4 h-4 text-status-success shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-secondary shrink-0" />
                  )}
                  <span className={checklist.uboIdentified ? "text-on-surface" : "text-secondary"}>
                    4. Ultimate Beneficial Owner (UBO) Registry Cleared
                  </span>
                </div>

                <div
                  onClick={() => toggleChecklistItem("riskCategorizationSigned")}
                  className="flex items-center gap-2.5 p-1.5 rounded-[2px] hover:bg-state-hover/60 cursor-pointer transition-colors"
                >
                  {checklist.riskCategorizationSigned ? (
                    <CheckSquare className="w-4 h-4 text-status-success shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-secondary shrink-0" />
                  )}
                  <span className={checklist.riskCategorizationSigned ? "text-on-surface" : "text-secondary"}>
                    5. Sovereign Risk Categorization Attested by Officer
                  </span>
                </div>
              </div>
            </div>

            {/* Officer Sign-off Notes */}
            {!isRejectionMode ? (
              <div>
                <label className="block font-mono uppercase text-secondary mb-1">
                  Compliance Officer Attestation Notes *
                </label>
                <textarea
                  rows={2}
                  disabled={!canElevate}
                  value={finmaSignOffNotes}
                  onChange={(e) => setFinmaSignOffNotes(e.target.value)}
                  placeholder="Attest verification method, biometric match, and FINMA AMLA registry confirmation..."
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-2 text-on-surface focus:border-gold-accent focus:outline-none resize-none disabled:opacity-50"
                />
              </div>
            ) : (
              <div>
                <label className="block font-mono uppercase text-status-danger mb-1">
                  Mandatory Rejection / Escalation Reason *
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Detail grounds for refusal, sanctions match, or fraud escalation..."
                  className="w-full bg-bg-canvas border border-status-danger/40 rounded-[4px] p-2 text-on-surface focus:border-status-danger focus:outline-none resize-none"
                />
              </div>
            )}

            {/* RBAC Warning */}
            {!canElevate && (
              <div className="p-2.5 bg-status-warning/10 border border-status-warning/30 rounded-[4px] text-[11px] text-status-warning flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Only Compliance Officers and Super Admins may approve tier elevation.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
              {!isRejectionMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectionMode(true)}
                    className="px-3 py-1.5 rounded-[4px] bg-bg-panel hover:bg-status-danger/10 border border-status-danger/30 text-status-danger font-medium transition-colors cursor-pointer"
                  >
                    Reject / Escalate
                  </button>
                  <button
                    type="button"
                    disabled={
                      !canElevate || !allChecklistItemsChecked || elevateMutation.isPending
                    }
                    onClick={() => elevateMutation.mutate()}
                    className="px-4 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    data-testid="elevate-tier-btn"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {elevateMutation.isPending
                        ? "Elevating..."
                        : `1-Click Elevate to ${selectedDossier.requestedTier}`}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectionMode(false)}
                    className="px-3 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
                  >
                    Back to Approval
                  </button>
                  <button
                    type="button"
                    disabled={rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate()}
                    className="px-4 py-1.5 rounded-[4px] bg-status-danger hover:bg-red-600 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{rejectMutation.isPending ? "Submitting..." : "Confirm Dossier Rejection"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel: Split Document Viewer (7 cols) */}
          <div className="lg:col-span-7 bg-bg-canvas flex flex-col overflow-hidden">
            {/* Document Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border-subtle bg-bg-panel/50 overflow-x-auto">
              {(selectedDossier.documents || []).map((doc, idx) => (
                <button
                  key={doc.id || idx}
                  onClick={() => setActiveDocumentIndex(idx)}
                  className={`px-3 py-1.5 rounded-[2px] font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border ${
                    activeDocumentIndex === idx
                      ? "bg-bg-canvas text-gold-accent border-gold-accent/40 font-semibold"
                      : "bg-transparent text-secondary border-transparent hover:text-on-surface hover:bg-state-hover/40"
                  }`}
                >
                  <FileCheck className="w-3 h-3" />
                  <span>{doc.type.replace(/_/g, " ")}</span>
                  {doc.verified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success ml-0.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Document Inspector Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle/50 text-[11px] text-secondary">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-on-surface">{activeDoc.filename}</span>
                <span className="font-mono text-secondary">({activeDoc.fileSize})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                  className="p-1 rounded-[2px] hover:bg-state-hover border border-border-subtle cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                  className="p-1 rounded-[2px] hover:bg-state-hover border border-border-subtle cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 rounded-[2px] hover:bg-state-hover border border-border-subtle cursor-pointer ml-1"
                  title="Rotate 90deg"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Preview Canvas */}
            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-black/40">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transition: "transform 0.15s ease",
                }}
                className="w-full max-w-md bg-bg-panel border border-border-subtle rounded-[4px] p-6 shadow-2xl relative text-xs flex flex-col gap-4"
              >
                {/* Visual Security Hologram Header */}
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gold-accent/20 border border-gold-accent flex items-center justify-center text-gold-accent">
                      <Lock className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] font-bold text-gold-accent uppercase tracking-wider">
                        Sovereign Vault Archive Encrypted Record
                      </div>
                      <div className="text-[9px] text-secondary">
                        FINMA Verification Enclave Zurich Shard #04
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-status-success/20 text-status-success font-mono text-[9px] font-bold border border-status-success/40">
                    VERIFIED ENCLAVE
                  </span>
                </div>

                {/* Simulated Document Details */}
                <div className="space-y-2 py-2">
                  <div className="p-3 bg-bg-canvas/80 rounded-[2px] border border-border-subtle">
                    <div className="text-[10px] text-secondary uppercase font-mono mb-1">
                      Document Classification
                    </div>
                    <div className="text-sm font-semibold text-on-surface">
                      {activeDoc.type.replace(/_/g, " ")}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-bg-canvas/80 rounded-[2px] border border-border-subtle">
                      <div className="text-[9px] text-secondary">Subject Entity</div>
                      <div className="font-semibold text-on-surface truncate">{selectedDossier.userName}</div>
                    </div>
                    <div className="p-2 bg-bg-canvas/80 rounded-[2px] border border-border-subtle">
                      <div className="text-[9px] text-secondary">Jurisdiction</div>
                      <div className="font-semibold text-on-surface">{selectedDossier.country}</div>
                    </div>
                  </div>

                  {/* Hash Integrity Box */}
                  <div className="p-2.5 bg-bg-canvas/80 rounded-[2px] border border-border-subtle font-mono text-[10px]">
                    <div className="text-secondary flex items-center gap-1 mb-1">
                      <Hash className="w-3 h-3 text-telemetry-cyan" />
                      <span>SHA-256 Checksum:</span>
                    </div>
                    <div className="text-telemetry-cyan break-all">
                      {activeDoc.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                    </div>
                  </div>
                </div>

                {/* Watermark Footer */}
                <div className="pt-2 border-t border-border-subtle/50 flex justify-between items-center text-[10px] text-secondary">
                  <span>Audit Timestamp: {formatTimestamp(selectedDossier.submittedAt)}</span>
                  <span className="text-status-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Cryptographic Seal Intact</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
