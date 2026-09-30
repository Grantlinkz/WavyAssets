import React, { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DollarSign, X, ShieldAlert, CheckCircle2, AlertTriangle, FileText, ArrowRight } from "lucide-react"
import { useUserRegistryStore } from "../../store/useUserRegistryStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { directFundUser, type BalanceType } from "../../api/users"
import { formatCurrency } from "../../lib/formatters"

export const DirectFundingModal: React.FC = () => {
  const { isDirectFundingModalOpen, closeFundingModal, selectedUser } = useUserRegistryStore()
  const { hasPermission } = useAdminAuthStore()
  const queryClient = useQueryClient()

  const [direction, setDirection] = useState<"CREDIT" | "DEBIT">("CREDIT")
  const [amount, setAmount] = useState("")
  const [targetBalance, setTargetBalance] = useState<BalanceType>("AVAILABLE_CASH")
  const [currency, setCurrency] = useState("USD")
  const [auditJustification, setAuditJustification] = useState("")
  const [complianceReferenceId, setComplianceReferenceId] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const canDirectFund = hasPermission("canDirectFund")

  React.useEffect(() => {
    if (selectedUser) {
      setCurrency(selectedUser.balances.currency || "USD")
      setAmount("")
      setAuditJustification("")
      setComplianceReferenceId("")
      setErrorMsg(null)
      setSuccessMsg(null)
      setDirection("CREDIT")
    }
  }, [selectedUser])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("No user selected for funding.")
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Funding amount must be a positive number greater than 0.")
      }
      if (!auditJustification.trim()) {
        throw new Error("Mandatory audit justification required for ledger capital adjustment.")
      }
      if (!complianceReferenceId.trim()) {
        throw new Error("Mandatory compliance / wire reference ID required.")
      }

      return directFundUser({
        userId: selectedUser.id,
        direction,
        amount: parsedAmount,
        targetBalance,
        currency,
        auditJustification: auditJustification.trim(),
        complianceReferenceId: complianceReferenceId.trim(),
      })
    },
    onSuccess: (data) => {
      setSuccessMsg(
        `Successfully ${direction === "CREDIT" ? "credited" : "debited"} ${formatCurrency(parseFloat(amount), currency)} ${direction === "CREDIT" ? "to" : "from"} ${
          targetBalance === "AVAILABLE_CASH" ? "Available Cash" : "Invested Capital"
        }. Transaction ID: ${data.transactionId || "Confirmed"}`
      )
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setTimeout(() => {
        closeFundingModal()
        setErrorMsg(null)
        setSuccessMsg(null)
      }, 1500)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Direct funding operation failed.")
    },
  })

  if (!isDirectFundingModalOpen || !selectedUser) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    mutation.mutate()
  }

  const userCurrency = selectedUser.balances.currency || "USD"
  const isCurrencyMatching = currency === userCurrency
  const currentAvailable = selectedUser.balances.availableCash
  const currentInvested = selectedUser.balances.investedCapital
  const parsedAmount = parseFloat(amount) || 0

  const projectedAvailable =
    direction === "CREDIT"
      ? (targetBalance === "AVAILABLE_CASH" ? currentAvailable + parsedAmount : currentAvailable)
      : (targetBalance === "AVAILABLE_CASH" ? Math.max(0, currentAvailable - parsedAmount) : currentAvailable)

  const projectedInvested =
    direction === "CREDIT"
      ? (targetBalance === "INVESTED_CAPITAL" ? currentInvested + parsedAmount : currentInvested)
      : (targetBalance === "INVESTED_CAPITAL" ? Math.max(0, currentInvested - parsedAmount) : currentInvested)

  const projectedTotal = projectedAvailable + projectedInvested

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={closeFundingModal}
      data-testid="direct-funding-modal"
    >
      <div
        className="w-full max-w-lg bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-border-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">
                Direct Supreme Ledger Funding
              </h2>
              <p className="text-xs text-secondary font-mono">{selectedUser.fullLegalName}</p>
            </div>
          </div>
          <button
            onClick={closeFundingModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current vs Projected Segregated Balances */}
        <div className="p-3 bg-bg-canvas border border-border-subtle rounded-[4px] mb-4 text-xs">
          <div className="text-[10px] font-mono uppercase text-secondary mb-2 tracking-wider">
            Ledger Segregation Telemetry ({userCurrency})
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="p-2 bg-bg-panel rounded-[2px] border border-border-subtle">
              <div className="text-[10px] text-secondary">Available Cash (Liquid)</div>
              <div className="font-mono tabular-nums text-sm font-bold text-on-surface">
                {formatCurrency(currentAvailable, userCurrency)}
              </div>
              {isCurrencyMatching ? (
                <div className="text-[10px] text-gold-accent flex items-center gap-1 mt-0.5">
                  <ArrowRight className="w-2.5 h-2.5" />
                  <span className="font-mono tabular-nums">{formatCurrency(projectedAvailable, userCurrency)}</span>
                </div>
              ) : (
                <div className="text-[10px] text-secondary italic mt-0.5">
                  Conversion required
                </div>
              )}
            </div>

            <div className="p-2 bg-bg-panel rounded-[2px] border border-border-subtle">
              <div className="text-[10px] text-secondary">Invested Capital (Vault)</div>
              <div className="font-mono tabular-nums text-sm font-bold text-on-surface">
                {formatCurrency(currentInvested, userCurrency)}
              </div>
              {isCurrencyMatching ? (
                <div className="text-[10px] text-telemetry-cyan flex items-center gap-1 mt-0.5">
                  <ArrowRight className="w-2.5 h-2.5" />
                  <span className="font-mono tabular-nums">{formatCurrency(projectedInvested, userCurrency)}</span>
                </div>
              ) : (
                <div className="text-[10px] text-secondary italic mt-0.5">
                  Conversion required
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border-subtle text-[11px]">
            <span className="text-secondary">Projected Total Balance:</span>
            {isCurrencyMatching ? (
              <span className="font-mono tabular-nums text-gold-accent font-bold">
                {formatCurrency(projectedTotal, userCurrency)}
              </span>
            ) : (
              <span className="font-mono text-status-warning text-[11px]">
                Cross-currency ({currency} into {userCurrency})
              </span>
            )}
          </div>
        </div>

        {!canDirectFund && (
          <div className="mb-4 p-3 bg-status-warning/10 border border-status-warning/30 rounded-[4px] text-xs text-status-warning flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>RBAC Restricted: Only Treasury Officers and Super Admins may inject ledger capital.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-status-danger/10 border border-status-danger/30 rounded-[4px] text-xs text-status-danger flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-status-success/10 border border-status-success/30 rounded-[4px] text-xs text-status-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          {/* Operation Direction: Credit vs Debit */}
          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Operation Direction *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("CREDIT")}
                className={`py-2 px-3 rounded-[4px] border font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  direction === "CREDIT"
                    ? "bg-status-success/20 border-status-success text-status-success font-semibold shadow-xs"
                    : "bg-bg-canvas border-border-subtle text-secondary hover:text-on-surface"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
                Credit (Inject / Deposit)
              </button>
              <button
                type="button"
                onClick={() => setDirection("DEBIT")}
                className={`py-2 px-3 rounded-[4px] border font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  direction === "DEBIT"
                    ? "bg-status-danger/20 border-status-danger text-status-danger font-semibold shadow-xs"
                    : "bg-bg-canvas border-border-subtle text-secondary hover:text-on-surface"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-status-danger inline-block"></span>
                Debit (Extract / Withdraw)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Target Segregated Balance *
              </label>
              <select
                value={targetBalance}
                onChange={(e) => setTargetBalance(e.target.value as BalanceType)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-1.5 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="AVAILABLE_CASH">AVAILABLE_CASH (Liquid)</option>
                <option value="INVESTED_CAPITAL">INVESTED_CAPITAL (Locked)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono uppercase text-secondary mb-1">
                Currency Base
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-1.5 text-on-surface focus:border-gold-accent focus:outline-none font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="CHF">CHF (CHF)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Funding Amount ({currency}) *
            </label>
            <div className="relative flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-gold-accent absolute left-3 pointer-events-none" />
              <input
                type="number"
                required
                min="1"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 font-mono text-on-surface focus:border-gold-accent focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Compliance / Wire Reference ID *
            </label>
            <input
              type="text"
              required
              value={complianceReferenceId}
              onChange={(e) => setComplianceReferenceId(e.target.value)}
              placeholder="e.g. SWIFT-CH9300000000000-09"
              className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-1.5 font-mono text-on-surface focus:border-gold-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono uppercase text-secondary mb-1">
              Mandatory Audit Justification *
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-secondary absolute left-3 top-2.5 pointer-events-none" />
              <textarea
                required
                rows={2}
                disabled={!canDirectFund}
                value={auditJustification}
                onChange={(e) => setAuditJustification(e.target.value)}
                placeholder="State wire origin, treasury confirmation number, or dual-sign-off ticket reference..."
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-2 text-on-surface focus:border-gold-accent focus:outline-none resize-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={closeFundingModal}
              className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !canDirectFund}
              className={`px-4 py-1.5 rounded-[4px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                direction === "CREDIT"
                  ? "bg-gold-accent hover:bg-[#C5A028] text-bg-canvas"
                  : "bg-status-danger hover:bg-red-700 text-white"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>
                {mutation.isPending
                  ? `Executing ${direction === "CREDIT" ? "Credit" : "Debit"}...`
                  : `${direction === "CREDIT" ? "Credit" : "Debit"} Supreme Ledger`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
