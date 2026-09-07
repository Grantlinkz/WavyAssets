import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, Building, FileCheck } from 'lucide-react';

export const RealEstatePanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const properties = [
    {
      id: 'prop-1',
      title: 'Bahnhofstrasse Trophy Retail & Banking SPV',
      location: 'Zurich 8001, Switzerland',
      type: 'Prime Grade-A Commercial Asset',
      capRate: '6.8% Net',
      valuation: '$84,000,000',
      tokenizedShare: 'ZUR-BH-01',
      occupancy: '100% (Credit Suisse / UBS Sub-tenant)',
    },
    {
      id: 'prop-2',
      title: 'Mayfair Fiduciary House & Private Club',
      location: 'London W1K, United Kingdom',
      type: 'Freehold Historic Commercial HQ',
      capRate: '7.4% Net',
      valuation: '$62,500,000',
      tokenizedShare: 'LDN-MAY-04',
      occupancy: '98% (20-Year Triple Net Lease)',
    },
    {
      id: 'prop-3',
      title: 'Geneva Lakeside Multi-Family Office Center',
      location: 'Geneva 1204, Switzerland',
      type: 'Commercial Freehold Waterfront Asset',
      capRate: '7.1% Net',
      valuation: '$49,000,000',
      tokenizedShare: 'GVA-LAK-02',
      occupancy: '100% Institutional MFOs',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-real-estate">
      {/* Hero */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ TOKENIZED PRIME REAL ESTATE // SOVEREIGN TROPHY SPVS ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                SWISS FINIA TITLE DEED REGISTERED
              </span>
            </div>

            <h3 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Tokenized Prime Real Estate &amp; SPV Deeds
            </h3>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Institutional ownership in debt-free trophy properties located in the world&apos;s
              most resilient financial districts. Fractionalized into cryptographic title deeds with
              automated quarterly dividend distributions and zero landlord management friction.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-acquire-deed"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acquire Fractional Deed</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <FileCheck className="w-3.5 h-3.5 text-primary" />
                <span>Inspect Land Registry Deeds</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                PORTFOLIO REAL ESTATE METRICS
              </span>
              <span className="font-mono text-[10px] text-secondary font-semibold">
                TRIPLE NET (NNN)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">MEAN CAP RATE</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">7.2%</div>
                <div className="font-mono text-[9px] text-outline">Quarterly Cash Div</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">AUM VALUE</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">$195.5M</div>
                <div className="font-mono text-[9px] text-primary">Zurich &amp; London</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">OCCUPANCY</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">99.4%</div>
                <div className="font-mono text-[9px] text-outline">AAA Tenants</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            TOKENIZED COMMERCIAL DEED DIRECTORY
          </span>
          <span className="font-mono text-[10px] text-outline">
            TITLE AUDIT: NOTARIZED ZURICH &amp; LONDON CADASTRE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {properties.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/50 transition-colors flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-primary font-bold">
                    {p.tokenizedShare}
                  </span>
                  <span className="font-mono text-xs font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-sm border border-secondary/20">
                    {p.capRate}
                  </span>
                </div>
                <div className="font-sans font-bold text-sm text-on-surface">{p.title}</div>
                <div className="font-sans text-xs text-outline">{p.location}</div>
                <div className="font-mono text-[10px] text-on-surface-variant pt-1">
                  {p.occupancy}
                </div>
              </div>

              <div className="pt-3 border-t border-outline/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-outline uppercase block">
                    Appraised Value
                  </span>
                  <span className="font-mono text-sm font-bold text-primary">{p.valuation}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('institutional')}
                  className="px-3 py-1.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-sans text-xs uppercase border border-outline/20 cursor-pointer transition-colors"
                >
                  View SPV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
