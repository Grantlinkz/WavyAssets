import React, { useEffect, useState } from 'react';
import { Headphones, Shield, X, ExternalLink, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  initSmartsupp,
  identifySmartsuppUser,
  openSmartsuppChat,
  getSmartsuppKey,
} from '../../lib/smartsupp';

interface SmartsuppChatProps {
  apiKey?: string;
  showCustomLauncher?: boolean;
}

export const SmartsuppChat: React.FC<SmartsuppChatProps> = ({
  apiKey,
  showCustomLauncher = true,
}) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showConfigNotice, setShowConfigNotice] = useState<boolean>(false);
  const activeKey = apiKey || getSmartsuppKey();

  useEffect(() => {
    initSmartsupp(activeKey);
  }, [activeKey]);

  useEffect(() => {
    if (user) {
      identifySmartsuppUser(user);
    }
  }, [user]);

  const handleLauncherClick = () => {
    if (!activeKey) {
      setShowConfigNotice(true);
      return;
    }
    openSmartsuppChat();
  };

  return (
    <>
      {/* Floating Institutional Concierge Launcher Button */}
      {showCustomLauncher && (
        <aside
          aria-label="Institutional live chat support"
          className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-auto"
        >
          <button
            type="button"
            data-testid="smartsupp-chat-launcher"
            onClick={handleLauncherClick}
            aria-label="Open 24/7 Institutional Concierge Live Chat"
            title="Open 24/7 Institutional Concierge Live Chat"
            className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-surface-container-high/90 hover:bg-surface-container-highest border border-primary/40 hover:border-primary text-on-surface shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            {/* Pulsing Live Operational Indicator */}
            <div className="relative flex items-center justify-center">
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Headphones className="h-4 w-4 text-primary group-hover:text-primary transition-colors" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-semibold tracking-wide text-on-surface flex items-center gap-1">
                Live Support
                <Sparkles className="h-2.5 w-2.5 text-primary opacity-80" />
              </span>
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
                Smartsupp Desk
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* Fallback Configuration Notice if Smartsupp key is not configured */}
      {showConfigNotice && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="smartsupp-config-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md bg-surface-container-low border border-border-hairline rounded-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="h-5 w-5" />
                <h3 className="text-sm font-semibold tracking-wide">
                  Smartsupp Live Chat Integration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigNotice(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-xs"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              The Smartsupp live chat engine is configured and ready in the user dashboard. To activate live chat with your account, set your Smartsupp Project Key in your environment file:
            </p>

            <div className="p-3 bg-surface-container-lowest border border-border-hairline rounded-xs font-mono text-[11px] text-primary break-all select-all">
              VITE_SMARTSUPP_KEY=your_smartsupp_key_here
            </div>

            <div className="text-[11px] text-on-surface-variant/80 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Account: {isAuthenticated && user ? user.fullName : 'Institutional Guest'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <span>Tier: {user?.tier || 'PRIVATE_WEALTH'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <a
                href="https://www.smartsupp.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xs text-xs font-mono text-on-surface-variant hover:text-primary transition-colors"
              >
                <span>Smartsupp Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                onClick={() => setShowConfigNotice(false)}
                className="px-4 py-1.5 rounded-xs text-xs font-semibold bg-primary text-primary-inverse hover:brightness-110 transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
