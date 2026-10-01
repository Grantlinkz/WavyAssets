import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { X, CreditCard, ShieldCheck, Check, Loader2, Info } from "lucide-react"
import { useVipCardsStore } from "../../store/useVipCardsStore"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { mintVipCard, type VipCardSubstrate, type VipCardTier } from "../../api/vipCards"
import { fetchUsers } from "../../api/users"
import { VipCard3DPreview } from "./VipCard3DPreview"
import { formatCurrency } from "../../lib/formatters"

interface MintVipCardModalProps {
  isOpen?: boolean
}

export const MintVipCardModal: React.FC<MintVipCardModalProps> = ({ isOpen }) => {
  const queryClient = useQueryClient()
  const { operator } = useAdminAuthStore()
  const { isMintModalOpen, setIsMintModalOpen, draftMint, setDraftMint, resetDraftMint } =
    useVipCardsStore()

  const { data: usersList } = useQuery({
    queryKey: ["users-mint-list"],
    queryFn: () => fetchUsers(),
  })

  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [secondaryOfficerToken, setSecondaryOfficerToken] = useState("")

  const mutation = useMutation({
    mutationFn: mintVipCard,
    onSuccess: () => {
      setIsSuccess(true)
      queryClient.invalidateQueries({ queryKey: ["vip-cards"] })
      queryClient.invalidateQueries({ queryKey: ["vip-cards-telemetry"] })
      setTimeout(() => {
        setIsSuccess(false)
        setIsMintModalOpen(false)
        setSecondaryOfficerToken("")
        resetDraftMint()
      }, 1200)
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to mint VIP card")
    },
  })

  const showModal = isOpen !== undefined ? isOpen : isMintModalOpen
  if (!showModal) return null

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 26)
    setDraftMint({ cardholderName: val })
  }

  const isCelebrity = draftMint.substrate === "Celebrity 24K Gold & Diamond"

  const handleSubstrateSelect = (substrate: VipCardSubstrate, tier: VipCardTier, defaultLimit: number) => {
    setDraftMint({
      substrate,
      tier,
      dailySpendLimit: substrate === "Celebrity 24K Gold & Diamond" ? 0 : defaultLimit,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!draftMint.userId || draftMint.userId.trim().length === 0) {
      setFormError("Client account selection is required.")
      return
    }

    if (!draftMint.cardholderName || draftMint.cardholderName.trim().length === 0) {
      setFormError("Laser-engraved cardholder name is required.")
      return
    }

    if (!isCelebrity && draftMint.dailySpendLimit > 500000 && !secondaryOfficerToken.trim()) {
      setFormError(
        "Daily spend limits exceeding $500,000 USD strictly require Secondary Officer authorization."
      )
      return
    }

    const combinedNotes = [
      draftMint.operatorNotes?.trim(),
      !isCelebrity && draftMint.dailySpendLimit > 500000
        ? `Secondary Officer Sign-off: ${secondaryOfficerToken.trim()}`
        : null,
      isCelebrity
        ? `Celebrity Membership Pass [Event Access Only] | Label: ${draftMint.celebrityCardholderLabel || "Celebrity Cardholder"} | Valid: ${draftMint.validDate || "09/31"}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ")

    mutation.mutate({
      userId: draftMint.userId,
      cardholderName: draftMint.cardholderName.trim(),
      tier: draftMint.tier,
      substrate: draftMint.substrate,
      dailySpendLimit: isCelebrity ? 0 : draftMint.dailySpendLimit,
      cardType: draftMint.cardType,
      destination: draftMint.destination,
      operatorNotes: combinedNotes || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-canvas/80 backdrop-blur-[4px] flex items-center justify-center p-4 overflow-y-auto"
      data-testid="mint-vip-card-modal"
    >
      <div className="w-full max-w-[880px] bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 bg-bg-elevated border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-gold-accent/15 border border-gold-accent/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gold-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Mint New Obsidian VIP Metal Card</h2>
              <p className="text-[11px] font-mono text-secondary">
                Swiss 42-gram tungsten precision milling &amp; ISO-8583 terminal authorization
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsMintModalOpen(false)
              setFormError(null)
            }}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px] hover:bg-state-hover transition-colors"
            data-testid="close-mint-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Grid */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-bg-panel">
            {/* Left Column: 3D Metallic Preview & Specs */}
            <div className="lg:col-span-5 flex flex-col items-center justify-start gap-4">
              <VipCard3DPreview
                cardholderName={draftMint.cardholderName}
                substrate={draftMint.substrate}
                expiryDate={draftMint.validDate || "09/31"}
                celebrityCardholderLabel={draftMint.celebrityCardholderLabel || "Celebrity Cardholder"}
              />
            </div>

            {/* Right Column: Issuance Parameters Form */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {formError && (
                <div className="p-2.5 bg-status-danger/10 border border-status-danger/40 rounded-[4px] text-xs text-status-danger font-mono">
                  {formError}
                </div>
              )}

              {/* Client Selection */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary">
                  Client &amp; Supreme Entity <span className="text-status-danger">*</span>
                </label>
                <select
                  value={draftMint.userId}
                  onChange={(e) => {
                    const selected = usersList?.find((u) => u.id === e.target.value)
                    setDraftMint({
                      userId: e.target.value,
                      cardholderName: selected?.fullLegalName ? selected.fullLegalName.toUpperCase() : draftMint.cardholderName,
                    })
                  }}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-xs text-on-surface focus:border-gold-accent focus:outline-none"
                  data-testid="client-select"
                >
                  <option value="">Select verified client account...</option>
                  {usersList?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullLegalName} ({u.id} • {u.accessTier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Laser-Engraved Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary">
                    Laser-Engraved Name <span className="text-status-danger">*</span>
                  </label>
                  <span className="text-secondary text-[10px] font-mono">Max 26 uppercase chars</span>
                </div>
                <input
                  type="text"
                  value={draftMint.cardholderName}
                  onChange={handleNameChange}
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-1.5 font-mono text-xs text-on-surface uppercase tracking-wider focus:border-gold-accent focus:outline-none"
                  placeholder="CARDHOLDER NAME"
                  data-testid="engraved-name-input"
                />
              </div>

              {/* Celebrity Cardholder Title / Name Option */}
              {isCelebrity && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-gold-accent font-semibold">
                      Celebrity Cardholder Title / Name
                    </label>
                    <span className="text-secondary text-[10px] font-mono">Custom celebrity name on card</span>
                  </div>
                  <input
                    type="text"
                    value={draftMint.celebrityCardholderLabel ?? "Celebrity Cardholder"}
                    onChange={(e) => setDraftMint({ celebrityCardholderLabel: e.target.value })}
                    className="w-full bg-bg-canvas border border-gold-accent/40 rounded-[4px] px-3 py-1.5 font-mono text-xs text-on-surface focus:border-gold-accent focus:outline-none"
                    placeholder="e.g., Celebrity Cardholder, Leonardo DiCaprio, VIP Headliner..."
                    data-testid="celebrity-cardholder-label-input"
                  />
                </div>
              )}

              {/* Valid Date Selection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary">
                    {isCelebrity ? "Event Access Valid Date (MM/YY)" : "Card Valid Thru Date (MM/YY)"}
                  </label>
                  <span className="text-secondary text-[10px] font-mono">Displays on card</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftMint.validDate ?? "09/31"}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9/]/g, "").slice(0, 5)
                      setDraftMint({ validDate: val })
                    }}
                    className="w-28 bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-1.5 font-mono text-xs text-on-surface focus:border-gold-accent focus:outline-none"
                    placeholder="MM/YY"
                    data-testid="valid-date-input"
                  />
                  <div className="flex items-center gap-1.5">
                    {["12/28", "06/30", "09/31", "12/35"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDraftMint({ validDate: preset })}
                        className={`px-2 py-1 rounded-[3px] font-mono text-[10px] border transition-colors cursor-pointer ${
                          (draftMint.validDate || "09/31") === preset
                            ? "bg-gold-accent/20 border-gold-accent text-gold-accent font-semibold"
                            : "bg-bg-canvas border-border-subtle text-secondary hover:text-on-surface"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Substrate & Metal Alloy Radio Tiles */}
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary">
                  Substrate &amp; Metal Alloy Grade
                </label>

                {/* Exclusive Celebrity Membership Card Option */}
                <div
                  onClick={() => handleSubstrateSelect("Celebrity 24K Gold & Diamond", "CELEBRITY", 0)}
                  className={`p-3 rounded-[4px] border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    draftMint.substrate === "Celebrity 24K Gold & Diamond"
                      ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border-[#FFD700] ring-1 ring-[#FFD700]/50 shadow-md"
                      : "bg-bg-canvas hover:bg-state-hover border-border-subtle hover:border-gold-accent/40"
                  }`}
                  data-testid="celebrity-card-section"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-bold text-sm ${
                      draftMint.substrate === "Celebrity 24K Gold & Diamond"
                        ? "bg-gradient-to-tr from-[#FFD700] to-[#FFF0A0] text-black shadow-sm"
                        : "bg-bg-elevated text-gold-accent border border-border-subtle"
                    }`}>
                      ★
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface">
                          Celebrity Membership Card
                        </span>
                        <span className="px-1.5 py-0.2 bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 text-[9px] font-mono font-bold rounded-[2px]">
                          EXCLUSIVE VIP
                        </span>
                      </div>
                      <span className="text-[10px] text-secondary font-mono">
                        Swiss 24K pure gold inlay &amp; diamond micro-lattice • Event Access Pass
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gold-accent hidden sm:inline">
                      Event Access Pass
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      draftMint.substrate === "Celebrity 24K Gold & Diamond"
                        ? "border-gold-accent bg-gold-accent"
                        : "border-secondary"
                    }`}>
                      {draftMint.substrate === "Celebrity 24K Gold & Diamond" && (
                        <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Obsidian Tungsten */}
                  <label
                    onClick={() => handleSubstrateSelect("Obsidian 42g Tungsten", "OBSIDIAN", 500000)}
                    className={`relative flex flex-col p-2.5 rounded-[4px] cursor-pointer transition-colors ${
                      draftMint.substrate === "Obsidian 42g Tungsten"
                        ? "border-2 border-gold-accent bg-bg-elevated"
                        : "border border-border-subtle bg-bg-canvas hover:bg-state-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gold-accent">Obsidian 42g</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          draftMint.substrate === "Obsidian 42g Tungsten"
                            ? "bg-gold-accent"
                            : "border border-border-subtle"
                        }`}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-on-surface font-semibold">$500k Default</span>
                    <span className="text-secondary text-[9px] leading-tight mt-0.5">Deep black PVD DLC</span>
                  </label>

                  {/* Option 2: Supreme Stainless */}
                  <label
                    onClick={() => handleSubstrateSelect("Black Supreme Stainless", "Supreme", 250000)}
                    className={`relative flex flex-col p-2.5 rounded-[4px] cursor-pointer transition-colors ${
                      draftMint.substrate === "Black Supreme Stainless"
                        ? "border-2 border-gold-accent bg-bg-elevated"
                        : "border border-border-subtle bg-bg-canvas hover:bg-state-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-on-surface">Supreme 28g</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          draftMint.substrate === "Black Supreme Stainless"
                            ? "bg-gold-accent"
                            : "border border-border-subtle"
                        }`}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-secondary font-semibold">$250k Default</span>
                    <span className="text-secondary text-[9px] leading-tight mt-0.5">Matte DLC steel</span>
                  </label>

                  {/* Option 3: Titanium */}
                  <label
                    onClick={() => handleSubstrateSelect("Silver Titanium", "TITANIUM", 100000)}
                    className={`relative flex flex-col p-2.5 rounded-[4px] cursor-pointer transition-colors ${
                      draftMint.substrate === "Silver Titanium"
                        ? "border-2 border-gold-accent bg-bg-elevated"
                        : "border border-border-subtle bg-bg-canvas hover:bg-state-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-on-surface">Titanium 18g</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          draftMint.substrate === "Silver Titanium"
                            ? "bg-gold-accent"
                            : "border border-border-subtle"
                        }`}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-secondary font-semibold">$100k Default</span>
                    <span className="text-secondary text-[9px] leading-tight mt-0.5">Grade-5 aerospace Ti</span>
                  </label>
                </div>
              </div>

              {/* Daily Limit Slider or Celebrity Event Access Disclaimer */}
              {isCelebrity ? (
                <div className="bg-bg-canvas border border-gold-accent/40 rounded-[4px] p-3.5 flex flex-col gap-2 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
                  <div className="flex items-center gap-2 text-gold-accent">
                    <ShieldCheck className="w-4 h-4 text-gold-accent shrink-0" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Celebrity Event Access Pass • Special Membership
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed font-sans">
                    The celebrity membership card is engineered strictly for accredited event admission and enclave privileges. No transactional daily spend limit, settlement debit, or credit threshold is applicable.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 bg-bg-canvas border border-border-subtle rounded-[4px] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                      Authorized Daily Limit
                    </span>
                    <span className="font-mono text-sm text-gold-accent font-semibold" data-testid="limit-display">
                      {formatCurrency(draftMint.dailySpendLimit)} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={25000}
                    value={draftMint.dailySpendLimit}
                    onChange={(e) => setDraftMint({ dailySpendLimit: Number(e.target.value) })}
                    className="w-full accent-[#D4AF37] cursor-pointer bg-bg-elevated h-1.5 rounded-[4px]"
                    data-testid="limit-slider"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-secondary">
                    <span>$50,000 Min</span>
                    <span className="text-status-warning font-semibold">Standard: $500,000</span>
                    <span>$1,000,000 Max</span>
                  </div>
                  {draftMint.dailySpendLimit > 500000 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-border-subtle">
                      <div className="flex items-center gap-1.5 text-[10px] text-status-warning">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Requires Secondary Officer sign-off if set above $500,000 USD.</span>
                      </div>
                      <input
                        type="password"
                        value={secondaryOfficerToken}
                        onChange={(e) => setSecondaryOfficerToken(e.target.value)}
                        placeholder="Enter Secondary Officer authorization PIN / token..."
                        className="w-full bg-bg-canvas border border-status-warning/40 rounded-[4px] px-2.5 py-1.5 font-mono text-xs text-on-surface focus:border-gold-accent focus:outline-none"
                        data-testid="secondary-officer-token-input"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Armored Destination */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary">
                  Secure Armored Destination
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                  {[
                    { title: "Zurich FreePort", subtitle: "Custody Vault A", val: "Zurich FreePort (Vault A)" },
                    { title: "Geneva Vault", subtitle: "Terminal Safe 04", val: "Geneva Vault (Safe 04)" },
                    { title: "Registered Address", subtitle: "Seestrasse 142, Zurich", val: "Registered Address (Seestrasse 142, Zurich)" },
                  ].map((dest) => (
                    <button
                      key={dest.val}
                      type="button"
                      onClick={() => setDraftMint({ destination: dest.val })}
                      className={`p-2 rounded-[4px] text-left transition-colors cursor-pointer ${
                        draftMint.destination === dest.val
                          ? "bg-bg-elevated border border-gold-accent"
                          : "bg-bg-canvas border border-border-subtle hover:border-gold-accent/40"
                      }`}
                    >
                      <span className={`block font-semibold text-[11px] ${draftMint.destination === dest.val ? "text-gold-accent" : "text-on-surface"}`}>
                        {dest.title}
                      </span>
                      <span className="text-[10px] text-secondary truncate block">{dest.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 border-t border-border-subtle bg-bg-elevated flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-secondary font-mono">
              <ShieldCheck className="w-4 h-4 text-status-success" />
              <span>
                Officer: <strong className="text-on-surface">{operator?.name || ""}</strong> {operator?.role ? `[${operator.role}]` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsMintModalOpen(false)
                  setFormError(null)
                }}
                className="px-4 py-1.5 rounded-[4px] border border-border-subtle bg-bg-panel hover:bg-state-hover text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending || isSuccess}
                className="px-4 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                data-testid="execute-mint-btn"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Engraving &amp; Encrypting...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Card Minted Successfully</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Mint &amp; Issue Card</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
