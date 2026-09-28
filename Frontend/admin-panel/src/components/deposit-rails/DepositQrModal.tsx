import React, { useState } from "react"
import { X, Copy, Check, QrCode, ShieldAlert } from "lucide-react"
import { useDepositRailsStore, type QrModalData } from "../../store/useDepositRailsStore"

interface DepositQrModalProps {
  data?: QrModalData | null
  isOpen?: boolean
  onClose?: () => void
}

export const DepositQrModal: React.FC<DepositQrModalProps> = ({
  data: propData,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const store = useDepositRailsStore()
  const qrModalData = propData !== undefined ? propData : store.qrModalData
  const isQrModalOpen = propIsOpen !== undefined ? propIsOpen : store.isQrModalOpen
  const closeQrModal = propOnClose ?? store.closeQrModal
  const [copied, setCopied] = useState(false)

  if (!isQrModalOpen || !qrModalData) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(qrModalData.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-canvas/80 backdrop-blur-sm"
      data-testid="qr-modal"
    >
      <div className="bg-bg-panel border border-border-subtle rounded-lg w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-elevated">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-gold-accent" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {qrModalData.asset} Depository QR
            </h2>
          </div>
          <button
            type="button"
            onClick={closeQrModal}
            className="p-1 rounded text-secondary hover:text-on-surface hover:bg-state-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-inner">
            {/* SVG Representation of QR matrix */}
            <svg
              className="w-48 h-48"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              {/* Corner position markers */}
              <rect x="10" y="10" width="25" height="25" fill="#090D14" />
              <rect x="15" y="15" width="15" height="15" fill="white" />
              <rect x="18" y="18" width="9" height="9" fill="#D4AF37" />

              <rect x="65" y="10" width="25" height="25" fill="#090D14" />
              <rect x="70" y="15" width="15" height="15" fill="white" />
              <rect x="73" y="18" width="9" height="9" fill="#D4AF37" />

              <rect x="10" y="65" width="25" height="25" fill="#090D14" />
              <rect x="15" y="70" width="15" height="15" fill="white" />
              <rect x="18" y="73" width="9" height="9" fill="#D4AF37" />

              {/* Data pixel simulation */}
              <rect x="40" y="15" width="5" height="5" fill="#090D14" />
              <rect x="50" y="20" width="5" height="5" fill="#090D14" />
              <rect x="45" y="30" width="5" height="5" fill="#090D14" />
              <rect x="55" y="35" width="5" height="5" fill="#090D14" />
              <rect x="20" y="45" width="5" height="5" fill="#090D14" />
              <rect x="30" y="50" width="5" height="5" fill="#090D14" />
              <rect x="40" y="45" width="5" height="5" fill="#D4AF37" />
              <rect x="50" y="55" width="5" height="5" fill="#090D14" />
              <rect x="60" y="45" width="5" height="5" fill="#090D14" />
              <rect x="70" y="55" width="5" height="5" fill="#090D14" />
              <rect x="80" y="45" width="5" height="5" fill="#090D14" />
              <rect x="45" y="65" width="5" height="5" fill="#090D14" />
              <rect x="55" y="75" width="5" height="5" fill="#090D14" />
              <rect x="65" y="65" width="5" height="5" fill="#090D14" />
              <rect x="75" y="75" width="5" height="5" fill="#090D14" />
              <rect x="85" y="85" width="5" height="5" fill="#090D14" />
            </svg>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <span className="font-mono text-body-sm text-gold-accent font-semibold">
              Network: {qrModalData.network}
            </span>
            <div className="flex items-center gap-2 bg-bg-elevated p-2 rounded border border-border-subtle w-full">
              <span className="font-mono text-body-sm text-on-surface truncate flex-1 text-left">
                {qrModalData.address}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded text-body-sm text-secondary hover:text-on-surface flex items-center gap-1 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-status-warning/10 border border-status-warning/30 rounded text-left">
            <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
            <span className="font-body-sm text-[11px] text-secondary">
              Strictly transfer <strong className="text-on-surface">{qrModalData.asset}</strong> on the{" "}
              <strong className="text-on-surface">{qrModalData.network}</strong> protocol. Deposits on incompatible chains cannot be recovered.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-subtle flex justify-end bg-bg-elevated">
          <button
            type="button"
            onClick={closeQrModal}
            className="px-4 py-1.5 bg-bg-canvas hover:bg-state-hover border border-border-subtle rounded font-title-sm text-body-sm text-on-surface transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
