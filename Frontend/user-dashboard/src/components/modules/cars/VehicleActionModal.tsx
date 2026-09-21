import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import {
  Car,
  Watch,
  CheckCircle2,
  Shield,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  X,
  Gauge,
  Lock,
} from 'lucide-react';
import { type ExoticAsset } from '../../../lib/alternativeAssetData';
import { useAlternativeStore } from '../../../store/useAlternativeStore';

interface VehicleActionModalProps {
  asset: ExoticAsset | null;
  mode: 'buy' | 'rent';
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleActionModal: React.FC<VehicleActionModalProps> = ({
  asset,
  mode: initialMode,
  isOpen,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<'buy' | 'rent'>(initialMode);
  const buyVehicleAsset = useAlternativeStore((s) => s.buyVehicleAsset);
  const leaseVehicleAsset = useAlternativeStore((s) => s.leaseVehicleAsset);

  // Buy state
  const [buyType, setBuyType] = useState<'full' | 'fractional'>('fractional');
  const [syndicatePct, setSyndicatePct] = useState<number>(10);
  const [vaultLocation, setVaultLocation] = useState<string>('Geneva Freeport Vault #4B');

  // Rent state
  const [leaseOption, setLeaseOption] = useState<string>(
    asset?.type === 'vehicle' ? 'weekend' : 'gala'
  );
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Monaco GP Circuit');

  // Free API VIN / Homologation state (NHTSA API)
  const [nhtsaData, setNhtsaData] = useState<{
    make?: string;
    model?: string;
    modelYear?: string;
    plantCountry?: string;
    bodyClass?: string;
    verified: boolean;
  } | null>(null);
  const [loadingVin, setLoadingVin] = useState<boolean>(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptTx, setReceiptTx] = useState('');

  useEffect(() => {
    setActiveMode(initialMode);
    setLeaseOption(asset?.type === 'vehicle' ? 'weekend' : 'gala');
    setIsSuccess(false);
    setIsProcessing(false);
  }, [initialMode, isOpen, asset]);

  // Connect to Free Public NHTSA Vehicle API for VIN validation
  useEffect(() => {
    if (!asset || !isOpen || asset.type !== 'vehicle') return;

    let isMounted = true;
    setLoadingVin(true);

    const vin =
      asset.primaryAttributes.find((a) => a.label.includes('VIN'))?.value ||
      'WP0ZZZ99ZTS390412';

    fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(vin)}?format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { Results?: Array<{ Make?: string; Model?: string; ModelYear?: string; PlantCountry?: string; BodyClass?: string }> }) => {
        if (!isMounted) return;
        const result = data?.Results?.[0];
        if (result && result.Make) {
          setNhtsaData({
            make: result.Make || 'Porsche',
            model: result.Model || '911',
            modelYear: result.ModelYear || '1997',
            plantCountry: result.PlantCountry || 'Germany',
            bodyClass: result.BodyClass || 'Coupe',
            verified: true,
          });
        } else {
          setNhtsaData({
            make: asset.title,
            plantCountry: 'Unavailable',
            bodyClass: 'Unverified',
            verified: false,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setNhtsaData({
            make: asset.title,
            plantCountry: 'Unavailable',
            bodyClass: 'Unverified',
            verified: false,
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingVin(false);
      });

    return () => {
      isMounted = false;
    };
  }, [asset, isOpen]);

  if (!asset) return null;

  const isVehicle = asset.type === 'vehicle';

  // Buy price calculation
  const totalBuyCost =
    buyType === 'full'
      ? asset.fairMarketValue
      : Math.round(asset.fairMarketValue * (syndicatePct / 100));

  // Rent cost calculation
  const rentPrices: Record<string, number> = isVehicle
    ? {
        track: 1850,
        weekend: 4800,
        monthly: 14500,
      }
    : {
        gala: 1200,
        week: 3500,
        month: 9000,
      };

  const effectiveRentCost = rentPrices[leaseOption] || (isVehicle ? 4800 : 1200);
  const insuranceEscrowDeposit = Math.round(effectiveRentCost * 0.5);

  const handleExecute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (activeMode === 'buy') {
        buyVehicleAsset(
          asset.id,
          totalBuyCost,
          buyType,
          buyType === 'fractional' ? syndicatePct : 100
        );
      } else {
        const durationLabel =
          leaseOption === 'monthly' || leaseOption === 'month'
            ? '30 Days'
            : leaseOption === 'week'
            ? '7 Days'
            : isVehicle
            ? 'Weekend'
            : 'Gala Event';
        leaseVehicleAsset(
          asset.id,
          leaseOption,
          durationLabel,
          effectiveRentCost
        );
      }
      const randomTx = `0x${Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
      setReceiptTx(randomTx);
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-surface-container-low border border-border-hairline p-0 overflow-hidden text-on-surface shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border-hairline bg-surface-container-lowest flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              {isVehicle ? <Car className="w-5 h-5" /> : <Watch className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Vault Custody: {asset.custodyEnclave}
                </span>
                <span className="px-1.5 py-0.2 bg-tertiary/10 text-tertiary rounded text-[9px] font-mono font-bold">
                  BONDED VAULT
                </span>
              </div>
              <DialogTitle className="font-serif text-base sm:text-lg font-bold text-on-surface mt-0.5">
                {asset.title}
              </DialogTitle>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close action modal"
            className="text-outline hover:text-on-surface p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Action Tabs: BUY vs RENT */}
        <div className="grid grid-cols-2 bg-surface-container border-b border-border-hairline font-mono text-xs">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              if (isProcessing) return;
              setActiveMode('buy');
              setIsSuccess(false);
            }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 font-semibold transition-colors ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              activeMode === 'buy'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Buy / Acquire Asset</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              if (isProcessing) return;
              setActiveMode('rent');
              setIsSuccess(false);
            }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 font-semibold transition-colors ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              activeMode === 'rent'
                ? 'border-primary text-primary bg-surface-container-lowest'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isVehicle ? 'Rent / Track Lease' : 'Rent / Gala Lease'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto font-mono text-xs">
          {/* Live Free NHTSA Vehicle API / Swiss Horology verification card */}
          {isVehicle && (
            <div className="p-3 bg-surface-container rounded border border-border-hairline space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-outline uppercase flex items-center gap-1 font-semibold">
                  <Gauge className="w-3 h-3 text-primary" />
                  <span>US NHTSA Public API VIN Verification</span>
                </span>
                {loadingVin ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : nhtsaData?.verified ? (
                  <span className="text-[10px] text-tertiary">
                    ✓ NHTSA Verified: {nhtsaData?.plantCountry}
                  </span>
                ) : (
                  <span className="text-[10px] text-outline">
                    VIN Telemetry Unverified / Unavailable
                  </span>
                )}
              </div>
              <div className="text-[11px] text-on-surface truncate">
                {nhtsaData?.verified
                  ? `${nhtsaData?.modelYear || ''} ${nhtsaData?.make || ''} ${nhtsaData?.model || ''} (${nhtsaData?.bodyClass || ''})`.trim()
                  : `${asset.title} (Registry Telemetry Offline)`}
              </div>
              <div className="flex justify-between items-center text-[10px] text-outline pt-1 border-t border-border-hairline">
                <span>Hagerty Index: {asset.indexBenchmark}</span>
                <span className="text-tertiary font-semibold">5-Yr: +{asset.indexTrend5YrPct}%</span>
              </div>
            </div>
          )}

          {!isVehicle && (
            <div className="p-3 bg-surface-container rounded border border-border-hairline space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-outline uppercase flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3 text-primary" />
                  <span>Geneva FreeZone Horology Registry</span>
                </span>
                <span className="text-[10px] text-tertiary font-bold">ARCHIVE CONFIRMED</span>
              </div>
              <div className="text-[11px] text-on-surface">
                Movement: CH 29-535 PS Q • 950 Platinum • Case #5892104
              </div>
              <div className="flex justify-between items-center text-[10px] text-outline pt-1 border-t border-border-hairline">
                <span>Insured: {asset.underwritingPolicy}</span>
                <span className="text-tertiary font-semibold">Score: 100.0 (Unworn Sealed)</span>
              </div>
            </div>
          )}

          {isSuccess ? (
            /* Success State */
            <div className="p-5 bg-tertiary/10 border border-tertiary/30 rounded-DEFAULT space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface">
                {activeMode === 'buy' ? 'Asset Acquisition Completed' : 'Lease Reservation Cleared'}
              </h3>
              <p className="text-xs text-outline max-w-md mx-auto">
                {activeMode === 'buy'
                  ? `Acquisition deed minted for ${asset.title}. Custody safely locked in ${vaultLocation}.`
                  : `Member reservation confirmed for ${asset.title}. Delivery logistics routed to ${deliveryLocation}.`}
              </p>
              <div className="p-2.5 bg-surface rounded text-[11px] text-outline border border-border-hairline text-left space-y-1">
                <div>Underwriter: <strong>{asset.underwritingPolicy}</strong></div>
                <div>Vault Safe: <strong>{vaultLocation}</strong></div>
                <div>Attestation Hash: <span className="text-primary">{receiptTx}</span></div>
              </div>
              <Button
                variant="default"
                onClick={onClose}
                className="w-full bg-primary text-on-primary font-mono text-xs font-semibold cursor-pointer"
              >
                Done
              </Button>
            </div>
          ) : activeMode === 'buy' ? (
            /* BUY FLOW */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold block">
                  Ownership Structure:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyType('fractional')}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                      buyType === 'fractional'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-hairline bg-surface text-on-surface'
                    }`}
                  >
                    <div className="font-bold">Vault Syndicate Share</div>
                    <div className="text-[10px] text-outline mt-0.5">
                      Fractional Syndicate Holding
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuyType('full')}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                      buyType === 'full'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-hairline bg-surface text-on-surface'
                    }`}
                  >
                    <div className="font-bold">100% Sole Title</div>
                    <div className="text-[10px] text-outline mt-0.5">
                      Full Physical Ownership
                    </div>
                  </button>
                </div>
              </div>

              {buyType === 'fractional' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-outline uppercase font-semibold flex justify-between">
                    <span>Syndicate Ownership Percentage:</span>
                    <span className="text-primary font-bold">{syndicatePct}% Share</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 25, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSyndicatePct(pct)}
                        className={`py-1.5 px-2 text-center rounded border font-mono text-xs cursor-pointer ${
                          syndicatePct === pct
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold block">
                  Bonded Custody Vault:
                </label>
                <select
                  value={vaultLocation}
                  onChange={(e) => setVaultLocation(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-surface border border-border-hairline rounded text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Geneva Freeport Vault #4B">Geneva Freeport Vault #4B (DIN 14096 Climate)</option>
                  <option value="Zurich Old Town Bank Enclave">Zurich Old Town Bank Enclave (Class IX Safe)</option>
                  <option value="Monaco Port Hercule Depository">Monaco Port Hercule Depository (Specie Escrow)</option>
                </select>
              </div>

              {/* Cost Summary */}
              <div className="p-3 bg-surface-container rounded border border-border-hairline space-y-1.5">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Consideration Amount:</span>
                  <span className="font-bold text-on-surface">
                    ${totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Lloyds Specie Insurance:</span>
                  <span className="text-tertiary font-bold">Active (#LL-CH-892401)</span>
                </div>
                <div className="flex justify-between text-outline text-[10px] pt-1 border-t border-border-hairline">
                  <span>Provenance Assay Fee:</span>
                  <span>Waived (Institutional Global Exemption)</span>
                </div>
              </div>

              <Button
                variant="default"
                disabled={isProcessing}
                onClick={handleExecute}
                className="w-full py-2.5 bg-primary text-on-primary font-mono font-semibold text-xs rounded hover:bg-primary-container flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Escrow &amp; Transferring Title...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Authorize Acquisition &amp; Mint Title</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* RENT FLOW */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold block">
                  {isVehicle ? 'Drive / Lease Program:' : 'Exhibition Lease Program:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {isVehicle ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setLeaseOption('track')}
                        className={`p-2 text-center rounded border cursor-pointer ${
                          leaseOption === 'track'
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        <div>Track Day</div>
                        <div className="text-[9px] opacity-80 mt-0.5">$1,850/day</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaseOption('weekend')}
                        className={`p-2 text-center rounded border cursor-pointer ${
                          leaseOption === 'weekend'
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        <div>Weekend Club</div>
                        <div className="text-[9px] opacity-80 mt-0.5">$4,800/wknd</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaseOption('monthly')}
                        className={`p-2 text-center rounded border cursor-pointer ${
                          leaseOption === 'monthly'
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        <div>30-Day Lease</div>
                        <div className="text-[9px] opacity-80 mt-0.5">$14,500/mo</div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setLeaseOption('gala')}
                        className={`p-2 text-center rounded border cursor-pointer ${
                          leaseOption === 'gala'
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        <div>Gala Event</div>
                        <div className="text-[9px] opacity-80 mt-0.5">$1,200/event</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaseOption('week')}
                        className={`p-2 text-center rounded border cursor-pointer ${
                          leaseOption === 'week'
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        <div>7-Day Loan</div>
                        <div className="text-[9px] opacity-80 mt-0.5">$3,500/wk</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaseOption('month')}
                        className={`p-2 text-center rounded border cursor-pointer ${
                          leaseOption === 'month'
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        <div>30-Day Safe</div>
                        <div className="text-[9px] opacity-80 mt-0.5">$9,000/mo</div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold block">
                  Concierge Handover Venue:
                </label>
                <select
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-surface border border-border-hairline rounded text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Monaco GP Circuit">Monaco GP Circuit (Port Hercule Concierge)</option>
                  <option value="Zurich Alps Tour">Zurich Alps Private Paddock</option>
                  <option value="Geneva Cointrin Private Aviation">Geneva Cointrin Private Terminal</option>
                  <option value="London Mayfair Vault Facility">London Mayfair Depository</option>
                </select>
              </div>

              {/* Lease Breakdown */}
              <div className="p-3 bg-surface-container rounded border border-border-hairline space-y-1.5">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Lease Consideration:</span>
                  <span className="font-bold text-on-surface">
                    ${effectiveRentCost.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Refundable Escrow Deposit:</span>
                  <span className="font-bold text-on-surface">
                    ${insuranceEscrowDeposit.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between text-outline text-[10px] pt-1 border-t border-border-hairline">
                  <span>Insurance Policy:</span>
                  <span className="text-tertiary">Lloyds 100% Comprehensive Transit Included</span>
                </div>
              </div>

              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded text-[11px] text-primary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Enclave concierge will deliver sealed custody kit to selected venue.</span>
              </div>

              <Button
                variant="default"
                disabled={isProcessing}
                onClick={handleExecute}
                className="w-full py-2.5 bg-primary text-on-primary font-mono font-semibold text-xs rounded hover:bg-primary-container flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing Concierge Dispatch...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Confirm Reservation &amp; Dispatch Concierge</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
