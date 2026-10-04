import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  RefreshCw,
  Radio,
  Network,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import {
  fetchDepositRails,
  flushInvalidationCache,
  type DepositRailsData,
} from "../api/depositRails"
import { useDepositRailsStore } from "../store/useDepositRailsStore"
import { FiatRailForm } from "../components/deposit-rails/FiatRailForm"
import { CryptoVaultMatrix } from "../components/deposit-rails/CryptoVaultMatrix"
import { DepositQrModal } from "../components/deposit-rails/DepositQrModal"

export const DepositRailsView: React.FC = () => {
  const queryClient = useQueryClient()
  const {
    isFlushingCache,
    setIsFlushingCache,
    setFlushCacheMessage,
  } = useDepositRailsStore()

  const [notification, setNotification] = useState<{
    type: "success" | "info" | "error"
    text: string
  } | null>(null)

  const {
    data: railsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DepositRailsData, Error>({
    queryKey: ["deposit-rails"],
    queryFn: fetchDepositRails,
  })


  const flushCacheMutation = useMutation({
    mutationFn: async () => {
      setIsFlushingCache(true)
      return flushInvalidationCache()
    },
    onSuccess: (res) => {
      setIsFlushingCache(false)
      setFlushCacheMessage(res.message)
      queryClient.invalidateQueries({ queryKey: ["deposit-rails"] })
      setNotification({
        type: "info",
        text: `${res.message} (${res.flushedNodesCount} edge cache nodes invalidated).`,
      })
      setTimeout(() => setNotification(null), 6000)
    },
    onError: (err: Error) => {
      setIsFlushingCache(false)
      setNotification({
        type: "error",
        text: err.message || "Failed to flush invalidation cache.",
      })
    },
  })

  return (
    <div className="flex flex-col gap-5 w-full" data-testid="deposit-rails-view">
      {/* Top Section: Header & Live Broadcaster Telemetry Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-bg-panel border border-border-subtle p-5 rounded-[6px] shadow-sm">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-lg font-bold text-on-surface tracking-tight">
                Global Deposit Coordinates
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-status-success/10 border border-status-success/30">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                <span className="font-mono text-[10px] text-status-success uppercase font-semibold">
                  Production Inflow Stream
                </span>
              </div>
              <span className="font-mono text-xs text-secondary bg-bg-elevated px-2.5 py-0.5 rounded-[3px] border border-border-subtle">
                Config Version: {railsData?.telemetry?.configVersion ?? "Unavailable"}
              </span>
            </div>
            <p className="font-sans text-xs text-secondary max-w-4xl leading-relaxed">
              Update institutional bank wire clearing parameters and cryptographic cold storage endpoints. Modifications propagate deterministically to connected tier-1 client deposit modals across all regional nodes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">

            <button
              type="button"
              disabled={isFlushingCache}
              onClick={() => flushCacheMutation.mutate()}
              className="h-8 px-3.5 rounded-[4px] border border-status-warning/40 bg-status-warning/10 text-status-warning hover:bg-status-warning/20 font-sans text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              id="btn-emergency-broadcast"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFlushingCache ? "animate-spin" : ""}`} />
              <span>{isFlushingCache ? "Flushing..." : "Flush Invalidation Cache"}</span>
            </button>
          </div>
        </div>

        {notification && (
          <div
            className={`p-3 rounded text-body-sm flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-status-success/10 border border-status-success/30 text-status-success"
                : notification.type === "info"
                ? "bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan"
                : "bg-status-danger/10 border border-status-danger/30 text-status-danger"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : notification.type === "info" ? (
              <Radio className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* Real-time Cluster Diagnostic Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-[6px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-status-success/10 border border-status-success/20 flex items-center justify-center">
                <Radio className="w-4 h-4 text-status-success" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                  Broadcaster Bridge
                </span>
                <span className="font-sans text-xs font-semibold text-on-surface">
                  {railsData?.telemetry?.broadcasterConnected !== false
                    ? "Live Broadcast Connected"
                    : "Connecting..."}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs text-status-success bg-status-success/10 px-2.5 py-1 rounded-[3px] border border-status-success/30 font-semibold">
              Active Feed
            </span>
          </div>

          <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-[6px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-telemetry-cyan/10 border border-telemetry-cyan/20 flex items-center justify-center">
                <Network className="w-4 h-4 text-telemetry-cyan" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                  WebSocket Sync Latency
                </span>
                <span className="font-mono text-xs text-on-surface font-semibold">
                  {railsData?.telemetry?.wsLatencyMs != null
                    ? `${railsData.telemetry.wsLatencyMs}ms Average RTT`
                    : "— Latency Unavailable"}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs text-telemetry-cyan bg-telemetry-cyan/10 px-2.5 py-1 rounded-[3px] border border-telemetry-cyan/30 font-semibold">
              {railsData?.telemetry?.activeTerminalsCount != null
                ? `${railsData.telemetry.activeTerminalsCount.toLocaleString()} Terminals`
                : "— Terminals"}
            </span>
          </div>

          <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-[6px] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[4px] bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-gold-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                  Ledger Verification HSM
                </span>
                <span className="font-sans text-xs font-semibold text-on-surface">
                  {railsData?.telemetry?.hsmStatus ?? "Unavailable"}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs text-gold-accent bg-gold-accent/10 px-2.5 py-1 rounded-[3px] border border-gold-accent/30 font-semibold">
              FIPS 140-2 Level 3
            </span>
          </div>
        </div>
      </div>

      {isError && (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded flex items-center justify-between text-status-danger text-body-sm">
          <span>Failed to fetch live deposit rail coordinates: {error.message}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-2 py-1 bg-bg-canvas border border-border-subtle rounded text-on-surface hover:bg-state-hover"
          >
            Retry
          </button>
        </div>
      )}

      {/* Section 1: Institutional Fiat Wire Coordinates Form */}
      <FiatRailForm initialConfig={railsData?.fiatRail} />

      {/* Section 2: Crypto Cold Storage Vault Matrix */}
      <CryptoVaultMatrix
        rails={railsData?.cryptoRails || []}
        isLoading={isLoading}
      />

      {/* Deposit QR Modal */}
      <DepositQrModal />
    </div>
  )
}
