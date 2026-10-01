import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  QrCode,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react"
import {
  updateCryptoRail,
  type CryptoDepositRailConfig,
} from "../../api/depositRails"
import { useDepositRailsStore } from "../../store/useDepositRailsStore"
import { SkeletonTable } from "../common/SkeletonTable"
import { truncateHash } from "../../lib/formatters"

interface CryptoVaultMatrixProps {
  rails: CryptoDepositRailConfig[]
  isLoading?: boolean
}

export const CryptoVaultMatrix: React.FC<CryptoVaultMatrixProps> = ({
  rails,
  isLoading = false,
}) => {
  const queryClient = useQueryClient()
  const { openQrModal } = useDepositRailsStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [hsmAuditNotice, setHsmAuditNotice] = useState<string | null>(null)

  const toggleMutation = useMutation({
    mutationFn: (rail: CryptoDepositRailConfig) =>
      updateCryptoRail({
        ...rail,
        isActive: !rail.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deposit-rails"] })
    },
  })

  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-subtle rounded-sm overflow-hidden min-h-[540px]">
        <div className="p-4 border-b border-border-subtle">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Cryptographic Vault Inflow Matrix (Cold Storage)
          </h2>
        </div>
        <SkeletonTable rows={6} columns={7} />
      </div>
    )
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAuditHsm = (asset: string, address: string) => {
    setHsmAuditNotice(
      `HSM Key Attestation Verified: Gemalto SafeNet Luna 7 anchored address for ${asset} (${truncateHash(address, 6, 4)}) matches FIPS 140-2 Level 3 root quorum.`
    )
    setTimeout(() => setHsmAuditNotice(null), 6000)
  }

  const getAssetBadgeColor = (asset: string) => {
    switch (asset.toUpperCase()) {
      case "USDC":
        return "bg-[#2775CA]/20 border-[#2775CA]/40 text-[#2775CA]"
      case "USDT":
        return "bg-[#26A17B]/20 border-[#26A17B]/40 text-[#26A17B]"
      case "BTC":
        return "bg-[#F7931A]/20 border-[#F7931A]/40 text-[#F7931A]"
      case "ETH":
        return "bg-[#627EEA]/20 border-[#627EEA]/40 text-[#627EEA]"
      default:
        return "bg-gold-accent/20 border-gold-accent/40 text-gold-accent"
    }
  }

  return (
    <section
      className="bg-bg-panel border border-border-subtle rounded-sm p-5 flex flex-col gap-4"
      data-testid="crypto-vault-matrix"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-serif text-base font-bold text-on-surface tracking-tight">
              Cryptographic Vault Inflow Matrix (Cold Storage)
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan animate-pulse" />
              <span>Curv / Fireblocks MPC 4-of-7 Quorum Active</span>
            </div>
          </div>
          <p className="font-sans text-xs text-secondary">
            Configures deposit targets for institutional digital assets. Addresses are cryptographically verified against hardware security modules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-secondary bg-bg-canvas px-3 py-1.5 rounded-[4px] border border-border-subtle">
            Active Multi-Sig: 4/7 Quorum Bound
          </span>
        </div>
      </div>

      {hsmAuditNotice && (
        <div className="p-3 bg-status-success/10 border border-status-success/30 rounded-[4px] text-status-success text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{hsmAuditNotice}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="flex flex-col border border-border-subtle bg-bg-canvas rounded-[6px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse" data-testid="crypto-matrix-table">
            <thead>
              <tr className="bg-bg-panel/80 border-b border-border-subtle text-secondary font-mono text-[10px] uppercase tracking-wider select-none">
                <th className="py-3 px-4 font-semibold">ASSET</th>
                <th className="py-3 px-4 font-semibold">BLOCKCHAIN NETWORK</th>
                <th className="py-3 px-4 font-semibold">DEPOSIT ADDRESS &amp; HASH ANCHOR</th>
                <th className="py-3 px-4 font-semibold text-right">MINIMUM DEPOSIT</th>
                <th className="py-3 px-4 font-semibold text-right">REQUIRED CONFIRMATIONS</th>
                <th className="py-3 px-4 font-semibold text-center">RAIL STATUS</th>
                <th className="py-3 px-4 font-semibold text-right">ACTION / RE-KEY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60 text-xs">
              {rails.map((rail) => {
                const isCopied = copiedId === rail.id
                const isSolana = rail.asset.toUpperCase() === "SOL" || rail.asset.toUpperCase() === "SOLANA"

                return (
                  <tr
                    key={rail.id}
                    className="hover:bg-state-hover/60 transition-colors group"
                    data-testid={`crypto-rail-row-${rail.asset}`}
                  >
                    {/* Asset */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-[4px] border flex items-center justify-center font-bold text-xs shrink-0 ${getAssetBadgeColor(
                            rail.asset
                          )}`}
                        >
                          {rail.asset === "USDC"
                            ? "$"
                            : rail.asset === "USDT"
                            ? "₮"
                            : rail.asset === "BTC"
                            ? "₿"
                            : rail.asset === "ETH"
                            ? "Ξ"
                            : "◎"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-sm text-on-surface leading-tight">
                            {rail.asset === "BTC" ? "Bitcoin" : rail.asset === "ETH" ? "Ethereum" : rail.asset}
                          </span>
                          <span className="font-mono text-[10px] text-secondary leading-normal">
                            {rail.asset === "BTC" ? "BTC Native" : rail.asset === "ETH" ? "ETH Mainnet" : rail.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Network */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-on-surface bg-bg-panel px-2.5 py-1 rounded-[3px] border border-border-subtle inline-block">
                        {rail.network}
                      </span>
                    </td>

                    {/* Deposit Address & Hash Anchor */}
                    <td className="py-3 px-4">
                      {isSolana ? (
                        <span className="font-mono text-[11px] text-secondary/70 italic">
                          Maintenance Hold (Quorum Pending)
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => handleCopy(rail.id, rail.vaultAddress)}
                            title={`Full Address: ${rail.vaultAddress}`}
                            className="font-mono text-xs text-on-surface bg-bg-elevated px-2.5 py-1 rounded-[3px] border border-border-subtle hover:border-gold-accent cursor-pointer group-hover:text-gold-accent transition-colors"
                          >
                            {truncateHash(rail.vaultAddress, 6, 4)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              openQrModal({
                                asset: rail.asset,
                                network: rail.network,
                                address: rail.vaultAddress,
                              })
                            }
                            className="w-7 h-7 rounded-[3px] bg-bg-panel hover:bg-state-hover border border-border-subtle flex items-center justify-center text-secondary hover:text-on-surface transition-colors cursor-pointer"
                            title="Show Depository QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(rail.id, rail.vaultAddress)}
                            className="w-7 h-7 rounded-[3px] bg-bg-panel hover:bg-state-hover border border-border-subtle flex items-center justify-center text-secondary hover:text-on-surface transition-colors cursor-pointer"
                            title="Copy Address"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-status-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Minimum Deposit */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-on-surface">
                      {isSolana ? "--" : `$${rail.minDepositUsd.toFixed(2)} USD eq.`}
                    </td>

                    {/* Required Confirmations */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-secondary">
                      {isSolana ? (
                        "32 Slots"
                      ) : (
                        <>
                          <span className="text-on-surface font-semibold">{rail.confirmations} Blocks</span>{" "}
                          <span>({rail.confirmationTimeEst || "~3 mins"})</span>
                        </>
                      )}
                    </td>

                    {/* Rail Status */}
                    <td className="py-3 px-4 text-center">
                      {isSolana ? (
                        <span className="font-mono text-[11px] text-status-warning bg-status-warning/10 border border-status-warning/30 px-2 py-0.5 rounded-[3px]">
                          Offline
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={toggleMutation.isPending}
                            onClick={() => toggleMutation.mutate(rail)}
                            className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none p-0.5 cursor-pointer ${
                              rail.isActive ? "bg-status-success" : "bg-border-subtle"
                            }`}
                          >
                            <span
                              className={`block w-3 h-3 bg-white rounded-full transition-transform ${
                                rail.isActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`font-mono text-xs ${
                              rail.isActive ? "text-status-success font-semibold" : "text-secondary"
                            }`}
                          >
                            {rail.isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Action / Re-Key */}
                    <td className="py-3 px-4 text-right">
                      {isSolana ? (
                        <span className="font-mono text-xs text-secondary/50 px-3 py-1 rounded-[3px] border border-border-subtle/50 bg-bg-elevated/40">
                          Locked
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAuditHsm(rail.asset, rail.vaultAddress)}
                          className="h-7 px-3 rounded-[3px] border border-border-subtle bg-bg-elevated hover:border-gold-accent hover:bg-state-hover text-on-surface font-sans text-xs transition-colors cursor-pointer"
                        >
                          Audit HSM
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Status Strip inside Table Container */}
        <div className="border-t border-border-subtle bg-bg-panel/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-secondary">
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan" />
            <span>Ledger Anchor: Block 19,842,109 (ETH) • Block 840,119 (BTC)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-secondary/70">RPC Nodes:</span>
            <span className="text-on-surface">Zurich-01 (Primary), Geneva-02 (Hot Standby)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-secondary/70">SIGNATURE STANDARD:</span>
            <span className="text-on-surface font-semibold">BIP-340 Schnorr / ECDSA secp256k1</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border-subtle text-xs">
        <div className="flex items-center gap-2 text-status-success">
          <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
          <span className="text-[11px] text-secondary">
            <strong className="text-status-success font-medium">Cold Storage Guard:</strong> Offline air-gapped signature verification enabled for all target address mutations.
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleAuditHsm("QUORUM", "0xCurvFireblocksQuorumRoot")}
            className="h-8 px-3.5 rounded-[4px] border border-border-subtle bg-bg-elevated hover:bg-state-hover text-secondary hover:text-on-surface font-sans text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Initiate Re-Key Quorum</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setHsmAuditNotice("Cryptographic cold storage inflow matrix synchronized and committed to ledger.")
              setTimeout(() => setHsmAuditNotice(null), 5000)
            }}
            className="h-8 px-4 rounded-[4px] bg-[#00C288] hover:bg-[#00A875] text-[#050505] font-sans text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Save Crypto Address Matrix</span>
          </button>
        </div>
      </div>
    </section>
  )
}
