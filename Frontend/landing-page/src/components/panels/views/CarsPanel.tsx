import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { FileText, Lock, Warehouse, Sparkles, HelpCircle, ShieldCheck, CheckCircle2, Car } from 'lucide-react';

export const CarsPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const inventory = [
    {
      id: 'car-1',
      title: '1964 Ferrari 250 GTO Series II',
      provenance: 'Scaglietti Body #3757GT • Certified Classiche Red Book',
      depot: 'Zurich Vault 4',
      value: '$48,500,000',
      fractionalToken: 'F250-CH-01',
      delta: '+24.2%',
      status: 'Vault Stored',
    },
    {
      id: 'car-2',
      title: '1995 McLaren F1 LM Specification',
      provenance: 'Chassis #073 • High Downforce Kit • Factory Works',
      depot: 'Geneva Vault',
      value: '$24,800,000',
      fractionalToken: 'MF1-GE-09',
      delta: '+19.8%',
      status: 'Vault Stored',
    },
    {
      id: 'car-3',
      title: '1998 Porsche 911 GT1 Straßenversion',
      provenance: 'Chassis #005 • GT Homologation • 5,400km Documented',
      depot: 'Zurich Vault 2',
      value: '$16,200,000',
      fractionalToken: 'GT1-ZH-04',
      delta: '+15.4%',
      status: 'Sale Pending',
    },
    {
      id: 'car-4',
      title: 'Patek Philippe Grandmaster Chime 6300G',
      provenance: 'White Gold Double-Dial • 20 Complications • Seal of Geneva',
      depot: 'Geneva Secure Vault',
      value: '$9,400,000',
      fractionalToken: 'PP-6300-01',
      delta: '+11.2%',
      status: 'Vault Stored',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-cars">
      {/* 1. Hero Block */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Metadata & Narrative */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ AUTO INVESTMENT PLATFORM // COLLECTOR VEHICLES ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                100% INSURED REPLACEMENT VALUE
              </span>
            </div>

            <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Browse and invest in cars with proven historical value
            </h1>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Own shares in rare collector vehicles stored in climate-controlled vaults. Diversify your
              money with tangible assets that have beaten market inflation.
            </p>

            <div className="text-[11px] font-mono text-outline">
              Asset Depository: <span className="text-on-surface font-semibold">Exotic &amp; Historical Vehicle Vault</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-request-slot"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Browse &amp; Invest in Cars</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <FileText className="w-3.5 h-3.5 text-outline" />
                <span>Learn About Vault Storage</span>
              </button>
              <span className="font-mono text-[10px] text-outline ml-auto hidden sm:inline-block">
                INSPECTION ID: CHE-948.102.339
              </span>
            </div>
          </div>

          {/* Right Aggregate Vault Metrics */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                CAR VAULT PERFORMANCE
              </span>
              <span className="font-mono text-[10px] text-secondary flex items-center gap-1 font-semibold">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                REAL-TIME INDEX
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">5-YR APPRECIATION</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">+68.4%</div>
                <div className="font-mono text-[9px] text-outline">Historical Average</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">STORED VEHICLES</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">38 Cars</div>
                <div className="font-mono text-[9px] text-primary">$184.2M Value</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">VAULT CLIMATE</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">19&deg;C</div>
                <div className="font-mono text-[9px] text-secondary">48% RH CONSTANT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Breakdown: 3 Plain Benefit Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            A RELIABLE AUTO INVESTMENT PLATFORM
          </h2>
          <div className="group relative cursor-pointer">
            <span className="font-mono text-[11px] text-outline flex items-center gap-1 hover:text-primary transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              What is fractional car investing?
            </span>
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-72 p-2.5 bg-surface-container-highest text-on-surface text-xs rounded-sm border border-outline shadow-lg z-20">
              Fractional car investing allows multiple people to share ownership and returns of a single rare car.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Full-Value Insurance</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Every vehicle is fully insured at replacement value and kept in climate-regulated storage.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Fully Insured
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Car className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Fractional Ownership</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Start investing in rare Ferraris and McLarens without needing to purchase the entire vehicle.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-mono font-semibold">
                Own from $500
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Verified Provenance</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Independent experts inspect every title, service history, and chassis number before listing.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                Expert Certified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Inventory Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5" />
            FEATURED COLLECTOR VEHICLES IN VAULT
          </span>
          <span className="font-mono text-[10px] text-outline">
            TOTAL ASSETS UNDER CUSTODY: $184,200,000.00
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventory.map((item) => (
            <div
              key={item.id}
              data-testid={`inventory-item-${item.id}`}
              className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/50 transition-colors flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-bold text-sm sm:text-base text-on-surface">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-sm border border-outline/20">
                      {item.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-secondary bg-secondary/15 px-1.5 py-0.5 rounded-sm border border-secondary/20">
                      {item.delta}
                    </span>
                  </div>
                </div>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  {item.provenance}
                </p>
              </div>

              <div className="pt-3 border-t border-outline/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-outline uppercase block">
                    Vault Valuation
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base text-primary">
                    {item.value}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-outline uppercase block">
                    Storage Location
                  </span>
                  <span className="font-mono text-xs text-on-surface">{item.depot}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
