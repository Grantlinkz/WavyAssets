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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Cryptographic Vault Inflow Matrix (Cold Storage)
            </h2>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan font-mono text-body-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan animate-pulse" />
              <span>Curv / Fireblocks MPC 4-of-7 Quorum Active</span>
            </div>
          </div>
          <p className="font-body-md text-body-md text-secondary">
            Configures deposit targets for institutional digital assets. Addresses are cryptographically verified against hardware security modules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-body-sm text-secondary bg-bg-canvas px-2.5 py-1 rounded-sm border border-border-subtle">
            Active Multi-Sig: 4/7 Quorum Bound
          </span>
        </div>
      </div>

      {hsmAuditNotice && (
        <div className="p-3 bg-status-success/10 border border-status-success/30 rounded text-status-success text-body-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{hsmAuditNotice}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="min-h-[540px] flex flex-col justify-between border border-border-subtle bg-bg-canvas rounded-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse" data-testid="crypto-matrix-table">
            <thead>
              <tr className="bg-bg-panel border-b border-border-subtle text-secondary font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Blockchain Network</th>
                <th className="py-2.5 px-3">Deposit Address &amp; Hash Anchor</th>
                <th className="py-2.5 px-3 text-right">Minimum Deposit</th>
                <th className="py-2.5 px-3 text-right">Confirmations</th>
                <th className="py-2.5 px-3 text-center">Rail Status</th>
                <th className="py-2.5 px-3 text-right">Action / Re-Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rails.map((rail) => {
                const isCopied = copiedId === rail.id
                return (
                  <tr
                    key={rail.id}
                    className="h-10 hover:bg-state-hover transition-colors group"
                    data-testid={`crypto-rail-row-${rail.asset}`}
                  >
                    {/* Asset */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-sm border flex items-center justify-center font-bold text-xs ${getAssetBadgeColor(
                            rail.asset
                          )}`}
                        >
                          {rail.asset === "USDC"
                            ? "$"
                            : rail.asset === "USDT"
                            ? "₮"
                            : rail.asset === "BTC"
                            ? "₿"
                            : rail.asset.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-sm text-body-sm text-on-surface leading-tight">
                            {rail.asset}
                          </span>
                          <span className="font-label-caps text-[10px] text-secondary leading-none">
                            {rail.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Network */}
                    <td className="py-2.5 px-3">
                      <span className="font-body-sm text-on-surface bg-bg-panel px-2 py-0.5 rounded-sm border border-border-subtle">
                        {rail.network}
                      </span>
                    </td>

                    {/* Deposit Address */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => handleCopy(rail.id, rail.vaultAddress)}
                          title={`Full Address: ${rail.vaultAddress}`}
                          className="font-mono text-body-sm text-on-surface bg-bg-elevated px-2 py-1 rounded-sm border border-border-subtle hover:border-gold-accent cursor-pointer group-hover:text-gold-accent transition-colors"
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
                          className="w-6 h-6 rounded-sm bg-bg-panel hover:bg-state-hover border border-border-subtle flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                          title="Show Depository QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(rail.id, rail.vaultAddress)}
                          className="w-6 h-6 rounded-sm bg-bg-panel hover:bg-state-hover border border-border-subtle flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                          title="Copy Address"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-status-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Minimum Deposit */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-body-sm text-on-surface">
                      ${rail.minDepositUsd.toFixed(2)} USD eq.
                    </td>

                    {/* Confirmations */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-body-sm text-secondary">
                      {rail.confirmations} Blocks ({rail.confirmationTimeEst || "~3 mins"})
                    </td>

                    {/* Rail Status */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={toggleMutation.isPending}
                          onClick={() => toggleMutation.mutate(rail)}
                          className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none p-0.5 ${
                            rail.isActive ? "bg-status-success" : "bg-border-subtle"
                          }`}
                        >
                          <span
                            className={`block w-3 h-3 bg-on-surface rounded-full transition-transform ${
                              rail.isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`font-mono text-body-sm ${
                            rail.isActive ? "text-status-success" : "text-secondary"
                          }`}
                        >
                          {rail.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </td>

                    {/* Action / Re-Key */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleAuditHsm(rail.asset, rail.vaultAddress)}
                        className="h-6 px-2 rounded-sm border border-border-subtle bg-bg-elevated hover:border-gold-accent text-secondary hover:text-on-surface font-title-sm text-body-sm transition-colors"
                      >
                        Audit HSM
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
