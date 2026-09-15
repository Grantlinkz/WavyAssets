import React, { useState } from 'react';
import { Send, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

export const SovereignConciergeModal: React.FC = () => {
  const { isConciergeModalOpen, closeConciergeModal } = useGovernanceStore();

  const [category, setCategory] = useState('PRIVATE_AVIATION');
  const [requestText, setRequestText] = useState('');
  const [channel, setChannel] = useState<'SIGNAL' | 'WHATSAPP' | 'HOTLINE'>('SIGNAL');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setRequestText('');
        closeConciergeModal();
      }, 2000);
    }, 800);
  };

  if (!isConciergeModalOpen) return null;

  return (
    <Dialog open={isConciergeModalOpen} onOpenChange={(open) => !open && closeConciergeModal()}>
      <DialogContent data-testid="sovereign-concierge-modal" className="max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-secondary/15 rounded-DEFAULT border border-secondary/30">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <DialogTitle className="font-serif text-sm uppercase tracking-wide">
                Sovereign Private Concierge Desk
              </DialogTitle>
              <span className="font-mono text-[10px] text-tertiary">
                ZURICH
              </span>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-concierge-modal-btn"
            aria-label="Close concierge launcher"
            onClick={closeConciergeModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {isSent ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-serif text-sm font-bold text-on-surface">
              Dispatch Transmitted to Private Banker
            </span>
            <p className="text-xs font-sans text-outline max-w-xs">
              Your senior Zurich fiduciary partner has received your request via PGP-encrypted {channel}. Expected response: &lt; 8 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-outline uppercase block">
                Concierge Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-testid="concierge-category-select"
                className="w-full bg-surface-container border border-border-hairline rounded-DEFAULT px-2.5 py-1.5 text-xs font-mono text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="PRIVATE_AVIATION">Private Jet Charter & Aviation Escort</option>
                <option value="FINE_ART">Art & Horology Auction Syndication</option>
                <option value="CAR_FREIGHT">Exotic Vehicle Bonded Vault Logistics</option>
                <option value="WIRE_OVERRIDE">High-Value Atomic Settlement Override (&gt;$1M)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-outline uppercase block">
                Preferred Secure Dispatch Channel
              </label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setChannel('SIGNAL')}
                  className={`p-2 rounded-DEFAULT border text-center font-bold transition-colors ${
                    channel === 'SIGNAL'
                      ? 'bg-primary text-surface border-primary'
                      : 'bg-surface-container border-border-hairline text-outline hover:text-on-surface'
                  }`}
                >
                  Signal (PGP)
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('WHATSAPP')}
                  className={`p-2 rounded-DEFAULT border text-center font-bold transition-colors ${
                    channel === 'WHATSAPP'
                      ? 'bg-primary text-surface border-primary'
                      : 'bg-surface-container border-border-hairline text-outline hover:text-on-surface'
                  }`}
                >
                  WhatsApp VIP
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('HOTLINE')}
                  className={`p-2 rounded-DEFAULT border text-center font-bold transition-colors ${
                    channel === 'HOTLINE'
                      ? 'bg-primary text-surface border-primary'
                      : 'bg-surface-container border-border-hairline text-outline hover:text-on-surface'
                  }`}
                >
                  Voice Hotline
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-outline uppercase block">
                Bespoke Directive / Itinerary Details
              </label>
              <textarea
                rows={3}
                required
                data-testid="concierge-request-input"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Specify private air charter routing, tail number requirements, or fine art lot reference..."
                className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-2.5 text-xs font-sans text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !requestText.trim()}
              data-testid="submit-concierge-request-btn"
              className="w-full py-2 bg-primary hover:bg-primary-hover text-surface font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Transmitting via PGP Enclave...' : 'Dispatch Sovereign Request'}</span>
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
