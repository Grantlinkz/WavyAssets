import React from "react"
import type { VipCardSubstrate } from "../../api/vipCards"

interface VipCard3DPreviewProps {
  cardholderName: string
  maskedPan?: string
  expiryDate?: string
  substrate: VipCardSubstrate
}

export const VipCard3DPreview: React.FC<VipCard3DPreviewProps> = ({
  cardholderName,
  maskedPan = "•••• •••• •••• 5590",
  expiryDate = "09/31",
  substrate,
}) => {
  const getSubstrateDetails = (sub: VipCardSubstrate) => {
    switch (sub) {
      case "Black Supreme Stainless":
        return {
          weight: "28.00 grams",
          milling: "Laser Cut & Beveled",
          coating: "Matte DLC Stainless",
          bgGradient: "bg-gradient-to-br from-[#1c212c] via-[#0f131a] to-[#080b10]",
          borderClass: "border-[#3A4354]/60",
          accentColor: "#A6B4C9",
        }
      case "Silver Titanium":
        return {
          weight: "18.00 grams",
          milling: "Precision Wire EDM",
          coating: "Aerospace Grade 5 Ti",
          bgGradient: "bg-gradient-to-br from-[#2c3240] via-[#1a202c] to-[#121620]",
          borderClass: "border-[#64748B]/60",
          accentColor: "#E2E8F0",
        }
      case "Obsidian 42g Tungsten":
      default:
        return {
          weight: "42.00 grams",
          milling: "5-Axis CNC Mill",
          coating: "Vapor PVD DLC",
          bgGradient: "bg-gradient-to-br from-[#1E1B15] via-[#0F0E0C] to-[#050505]",
          borderClass: "border-gold-accent/40",
          accentColor: "#D4AF37",
        }
    }
  }

  const details = getSubstrateDetails(substrate)

  return (
    <div className="flex flex-col items-center gap-4 w-full" data-testid="vip-card-3d-preview">
      {/* 3D Physical Card Model Container */}
      <div
        className={`w-full max-w-[340px] aspect-[1.586] rounded-[8px] p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl border ${details.borderClass} ${details.bgGradient} transition-all duration-300 hover:scale-[1.02]`}
        style={{
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(212, 175, 55, 0.2)",
        }}
      >
        {/* Subtle Brushed Metal Surface Texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Top Row: Brand & EMV Chip / Swiss Cross Hologram */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-2" data-testid="card-brand-identity">
            {/* Official Favicon Squircle Emblem */}
            <div className="w-6 h-6 rounded-[5px] overflow-hidden shrink-0 flex items-center justify-center border border-gold-accent/40 shadow-sm bg-[#08090B]">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full p-0.5" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="14" fill="#08090B" />
                <rect x="1" y="1" width="62" height="62" rx="13" stroke="#D4AF37" strokeWidth="2.5" strokeOpacity="0.8" />
                <circle cx="32" cy="32" r="18" fill="#D4AF37" fillOpacity="0.15" />
                <path d="M 12 33 C 18 19, 26 19, 32 33 C 38 47, 46 47, 52 33" stroke="#D4AF37" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 12 42 C 18 28, 26 28, 32 42 C 38 56, 46 56, 52 42" stroke="#00C288" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
                <circle cx="32" cy="17" r="3.5" fill="#D4AF37" />
              </svg>
            </div>
            {/* Official Project Logo Brand Typography */}
            <div className="flex items-center text-[11px] tracking-[0.16em] uppercase font-sans font-bold leading-none select-none">
              <span className="text-[#DEE2F2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">WAVY</span>
              <span className="text-gold-accent font-semibold ml-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">ASSETS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gold EMV Contact Chip */}
            <div className="w-8 h-6 rounded-[2px] bg-gradient-to-tr from-[#947629] via-[#D4AF37] to-[#F3E7BE] border border-[#7A5B0F] p-0.5 flex flex-col justify-between shadow-inner">
              <div className="w-full h-px bg-[#7A5B0F]/50" />
              <div className="w-full flex justify-between">
                <div className="w-2.5 h-1.5 border border-[#7A5B0F]/50 rounded-[1px]" />
                <div className="w-2.5 h-1.5 border border-[#7A5B0F]/50 rounded-[1px]" />
              </div>
              <div className="w-full h-px bg-[#7A5B0F]/50" />
            </div>

            {/* Swiss Cross Hologram Stamp */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-telemetry-cyan/20 via-gold-accent/30 to-purple-500/20 border border-gold-accent/40 flex items-center justify-center">
              <span className="font-mono text-[8px] text-gold-accent font-bold">CH</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Masked Card PAN */}
        <div className="relative z-10 text-left my-1">
          <span
            className="font-mono text-sm tracking-[0.24em] text-[#E5D294] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
            data-testid="preview-masked-pan"
          >
            {maskedPan}
          </span>
        </div>

        {/* Bottom Row: Cardholder Name, Expiry & Visa Infinite */}
        <div className="relative z-10 flex items-end justify-between text-left">
          <div>
            <span className="font-mono text-[8px] uppercase tracking-wider text-secondary/70 block">
              Authorized Cardholder
            </span>
            <span
              className="font-mono text-xs uppercase tracking-wider text-[#F2E5BA] font-semibold block truncate max-w-[190px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              data-testid="preview-cardholder-name"
            >
              {cardholderName || "CARDHOLDER NAME"}
            </span>
            <span className="font-mono text-[9px] text-secondary/80 mt-0.5 block">
              VALID THRU: <span className="text-gold-accent font-semibold">{expiryDate}</span>
            </span>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="font-sans text-[13px] font-black italic tracking-tighter text-[#F2E5BA] leading-none">
              VISA
            </span>
            <span className="font-mono text-[7px] tracking-widest text-gold-accent uppercase font-bold mt-0.5">
              INFINITE
            </span>
          </div>
        </div>
      </div>

      {/* Material Weight & CNC Calibration Specification Box */}
      <div className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] p-2.5 text-left">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-secondary font-medium">Current Substrate:</span>
          <span className="text-gold-accent font-semibold" data-testid="preview-substrate-label">
            {substrate}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle text-[10px] font-mono">
          <div>
            <span className="text-secondary block">Weight:</span>
            <span className="text-on-surface font-semibold">{details.weight}</span>
          </div>
          <div>
            <span className="text-secondary block">Milling:</span>
            <span className="text-on-surface font-semibold">{details.milling}</span>
          </div>
          <div>
            <span className="text-secondary block">Coating:</span>
            <span className="text-on-surface font-semibold">{details.coating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
