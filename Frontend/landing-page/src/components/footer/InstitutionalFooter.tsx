import React from "react";
import { BrandLogo } from "../common/BrandLogo";
import { NewsletterDispatch } from "./NewsletterDispatch";
import {
  useTerminalStore,
  type AssetVerticalId,
} from "../../store/useTerminalStore";
import { ShieldCheck, ExternalLink } from "lucide-react";

export const InstitutionalFooter: React.FC = () => {
  const { setActiveAssetId } = useTerminalStore();

  const handleAssetClick = (id: AssetVerticalId) => {
    setActiveAssetId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="w-full bg-surface-container-lowest border-t border-outline/30 px-4 sm:px-6 pt-12 pb-8 z-10 relative"
      data-testid="institutional-footer"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-4">
          {/* Col 1: Brand & Regulatory Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-7 w-auto text-primary" />
              <span className="font-headline-sm text-base text-on-surface uppercase tracking-wider font-bold">
                WAVYASSETS
              </span>
            </div>

            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Sovereign institutional multi-asset custody, quantitative
              execution, and cross-collateral wealth orchestration for
              ultra-high-net-worth principals and family offices.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="font-mono text-[10px] px-2 py-1 rounded-sm bg-surface-container border border-outline/20 text-on-surface-variant flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                <span>SEC REGISTERED RIA (#801-128491)</span>
              </div>
              <div className="font-mono text-[10px] px-2 py-1 rounded-sm bg-surface-container border border-outline/20 text-on-surface-variant flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-secondary shrink-0" />
                <span>FINMA REGULATED VQF (SWITZERLAND)</span>
              </div>
              <div className="font-mono text-[10px] px-2 py-1 rounded-sm bg-surface-container border border-outline/20 text-on-surface-variant flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                <span>MAS EXEMPT INSTITUTIONAL OPERATOR</span>
              </div>
            </div>
          </div>

          {/* Col 2: Asset Verticals (7 Classes) */}
          <div className="space-y-3">
            <div className="font-sans text-xs text-primary uppercase tracking-widest font-bold">
              Asset Verticals (7 Classes)
            </div>
            <ul className="space-y-2 font-sans text-xs text-on-surface-variant">
              <li>
                <button
                  type="button"
                  onClick={() => handleAssetClick("crypto")}
                  className="hover:text-primary transition-colors cursor-pointer w-full text-left flex items-center justify-between"
                >
                  <span>Crypto Yields &amp; Cold Storage</span>
                  <span className="font-mono text-[10px] text-secondary font-semibold">
                    19.4% APY
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAssetClick("stocks")}
                  className="hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  Global Stocks &amp; DMA Equities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAssetClick("ai-funds")}
                  className="hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  AI Systematic Funds &amp; H100 Mesh
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAssetClick("real-estate")}
                  className="hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  Fractional Prime Real Estate
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAssetClick("cars")}
                  className="hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  Exotic Hypercars Inventory (38 Units)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAssetClick("vip-cards")}
                  className="hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  VIP Concierge Titanium Cards
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAssetClick("wallet")}
                  className="hover:text-primary transition-colors cursor-pointer w-full text-left"
                >
                  Sovereign Treasury Wallet &amp; Rails
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Institutional Protocol */}
          <div className="space-y-3">
            <div className="font-sans text-xs text-primary uppercase tracking-widest font-bold">
              Institutional Protocol
            </div>
            <ul className="space-y-2 font-sans text-xs text-on-surface-variant">
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Cold Enclave MPC Custody
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer flex items-center justify-between">
                <span>Proof of Reserves (Hourly Merkle)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Audited Return Methodologies
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                FIX 4.4 / REST API Documentation
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Direct Market Access (DMA) Routing
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Equinix NY4 &amp; LD4 Cross-Connects
              </li>
            </ul>
          </div>

          {/* Col 4: Governance & Disclosures */}
          <div className="space-y-3">
            <div className="font-sans text-xs text-primary uppercase tracking-widest font-bold">
              Governance &amp; Disclosures
            </div>
            <ul className="space-y-2 font-sans text-xs text-on-surface-variant">
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Global Privacy Framework
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Institutional Custody Agreement
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Anti-Money Laundering (AML/KYC)
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                Form ADV Part 2A Disclosures
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer">
                SOC 2 Type II System Report
              </li>
              <li className="hover:text-on-surface transition-colors cursor-pointer flex items-center gap-1.5">
                <span>System Status Telemetry</span>
                <ExternalLink className="w-3 h-3 text-outline" />
              </li>
            </ul>
          </div>

          {/* Col 5: Institutional Dispatch */}
          <div className="space-y-3">
            <NewsletterDispatch />
          </div>
        </div>

        {/* Mandatory Multi-Jurisdiction Regulatory Disclaimer */}
        <div className="pt-6 bg-surface-container-low/50 p-4 sm:p-5 rounded-sm border border-outline/20 space-y-3">
          <div className="font-mono text-[11px] text-outline leading-relaxed space-y-2">
            <p>
              <strong className="text-on-surface font-semibold">
                REGULATORY DISCLOSURES &amp; FIDUCIARY GOVERNANCE:
              </strong>{" "}
              WavyAssets / WavyAssetss LLC is an investment adviser registered
              with the U.S. Securities and Exchange Commission (SEC CRD
              #801-128491). SEC registration does not imply a certain level of
              skill or training. Custodial clearing and execution services are
              facilitated via omnibus and direct institutional clearing
              agreements with participating FINRA and SIPC members including BNY
              Mellon and State Street. Custody of physical and tokenized
              alternative assets (Freeport hypercars and physical commodities)
              is governed under Swiss law with independent vault auditing by SGS
              and underwritten by syndicates at Lloyd&apos;s of London.
            </p>
            <p>
              <strong className="text-on-surface font-semibold">
                NO SOLICITATION &amp; RISK NOTICE:
              </strong>{" "}
              This terminal interface does not constitute an offer to sell or
              the solicitation of an offer to buy any securities in any
              jurisdiction where such an offer or solicitation would be
              unlawful. Cross-collateral yields and systematic quantitative
              models are subject to market volatility. Past audited returns do
              not guarantee sovereign alpha or total capital preservation. Swiss
              client representations comply with the Federal Act on Financial
              Services (FinSA) and Federal Act on Financial Institutions
              (FinIA). Real-time Merkle tree attestations confirm 1:1 asset
              backing in cold HSM storage clusters.
            </p>
          </div>

          {/* Sub-bar Copyright & Compliance tags */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-outline/20 font-mono text-[11px] text-outline">
            <div>
              &copy; 2026 WavyAssets / WavyAssetss Global Limited. Engineered
              for Sovereign Capital. All rights reserved.
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="hover:text-on-surface transition-colors cursor-pointer">
                SEC Rule 206(4)-1
              </span>
              <span>&bull;</span>
              <span className="hover:text-on-surface transition-colors cursor-pointer">
                GDPR / FADP Compliant
              </span>
              <span>&bull;</span>
              <span className="hover:text-on-surface transition-colors cursor-pointer">
                FIX 4.4 Engine Rev 8.4
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
