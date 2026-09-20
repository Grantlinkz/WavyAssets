import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import {
  Building2,
  CheckCircle2,
  Shield,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { type RealEstateAsset } from '../../../lib/alternativeAssetData';
import { useAlternativeStore } from '../../../store/useAlternativeStore';

interface RealEstateActionModalProps {
  property: RealEstateAsset | null;
  mode: 'buy' | 'rent';
  isOpen: boolean;
  onClose: () => void;
}

export const RealEstateActionModal: React.FC<RealEstateActionModalProps> = ({
  property,
  mode: initialMode,
  isOpen,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<'buy' | 'rent'>(initialMode);
  const buyProperty = useAlternativeStore((s) => s.buyProperty);
  const leaseProperty = useAlternativeStore((s) => s.leaseProperty);

  // Buy state
  const [buyType, setBuyType] = useState<'tokens' | 'full'>('tokens');
  const [tokenQty, setTokenQty] = useState<number>(10);
  const [fundingSource, setFundingSource] = useState<'cash' | 'usdc'>('cash');

  // Rent state
  const [leaseTerm, setLeaseTerm] = useState<number>(12); // months
  const [unitType, setUnitType] = useState<string>('Full Commercial Floor');

  // Free API Cadastral data state
  const [geoData, setGeoData] = useState<{
    displayName: string;
    lat: string;
    lon: string;
    osmId?: string;
    verified?: boolean;
  } | null>(null);
  const [loadingGeo, setLoadingGeo] = useState<boolean>(false);

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptTx, setReceiptTx] = useState('');

  useEffect(() => {
    setActiveMode(initialMode);
    setIsSuccess(false);
    setIsProcessing(false);
  }, [initialMode, isOpen, property]);

  // Query Free OpenStreetMap Nominatim API for real-world cadastral geodata
  useEffect(() => {
    if (!property || !isOpen) return;

    let isMounted = true;
    setLoadingGeo(true);

    const query = encodeURIComponent(
      `${property.location.replace(/.*:\s*/, '')}, ${property.region}`
    );

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ display_name: string; lat: string; lon: string; osm_id: string }>) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setGeoData({
            displayName: data[0].display_name,
            lat: Number(data[0].lat).toFixed(4),
            lon: Number(data[0].lon).toFixed(4),
            osmId: data[0].osm_id,
            verified: true,
          });
        } else {
          // Graceful fallback coordinates for Swiss/European prime zones (unverified)
          setGeoData({
            displayName: `${property.location}, ${property.region} (Cadastre Telemetry Offline)`,
            lat: property.region === 'Switzerland' ? '47.3769' : property.region === 'United Kingdom' ? '51.5074' : '50.1109',
            lon: property.region === 'Switzerland' ? '8.5417' : property.region === 'United Kingdom' ? '-0.1278' : '8.6821',
            verified: false,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setGeoData({
            displayName: `${property.location}, ${property.region} (Cadastre Telemetry Offline)`,
            lat: '47.3769',
            lon: '8.5417',
            verified: false,
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingGeo(false);
      });

    return () => {
      isMounted = false;
    };
  }, [property, isOpen]);

  if (!property) return null;

  const tokenPrice = property.tokenPrice;
  const totalBuyCost =
    buyType === 'full' ? property.valuation : tokenQty * tokenPrice;
  const estimatedAnnualYield = (totalBuyCost * (property.netRentalYieldApy / 100));

  // Rent calculations
  const UNIT_TYPE_MULTIPLIERS: Record<string, number> = {
    'Full Commercial Floor': 1.0,
    'Executive Penthouse Floor': 1.25,
    'Ground Retail Unit': 0.8,
    'Full Building Triple-Net': 2.0,
  };
  const spaceMultiplier = UNIT_TYPE_MULTIPLIERS[unitType] || 1.0;
  const baseMonthlyRent = Math.round(
    (property.valuation * (property.netRentalYieldApy / 100) / 12) * spaceMultiplier
  );
  const termDiscount = leaseTerm === 36 ? 0.9 : leaseTerm === 24 ? 0.95 : 1.0;
  const effectiveMonthlyRent = Math.round(baseMonthlyRent * termDiscount);
  const securityDeposit = effectiveMonthlyRent * 2;

  const handleExecute = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (activeMode === 'buy') {
        const tokensAcquired =
          buyType === 'full' ? property.tokenCount : tokenQty;
        buyProperty(property.id, tokensAcquired, tokenPrice);
      } else {
        leaseProperty(property.id, leaseTerm, effectiveMonthlyRent, unitType);
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  SPV Registry: {property.spvCode}
                </span>
                <span className="px-1.5 py-0.2 bg-tertiary/10 text-tertiary rounded text-[9px] font-mono font-bold">
                  DLT VERIFIED
                </span>
              </div>
              <DialogTitle className="font-serif text-lg font-bold text-on-surface mt-0.5">
                {property.name}
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

        {/* Action Selector Tabs: BUY vs RENT */}
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
            <span>Buy / Invest In Building</span>
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
            <span>Rent / Lease Space</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto font-mono text-xs">
          {/* Live Cadastral Geolocation Header (Free OpenStreetMap API Data) */}
          <div className="p-3 bg-surface-container rounded border border-border-hairline space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-outline uppercase flex items-center gap-1 font-semibold">
                <MapPin className="w-3 h-3 text-primary" />
                <span>Live OpenStreetMap Cadastre Telemetry</span>
              </span>
              {loadingGeo ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
              ) : geoData?.verified ? (
                <span className="text-[10px] text-tertiary">
                  Lat: {geoData?.lat}° | Lon: {geoData?.lon}°
                </span>
              ) : (
                <span className="text-[10px] text-outline">
                  Cadastre Coordinates Offline / Unverified
                </span>
              )}
            </div>
            <div className="text-[11px] text-on-surface truncate font-sans">
              {geoData?.displayName || property.location}
            </div>
            <div className="flex justify-between items-center text-[10px] text-outline pt-1 border-t border-border-hairline">
              <span>Appraisal: {property.appraisalStandard}</span>
              <span className="text-primary font-bold">Occupancy: {property.occupancyPct}%</span>
            </div>
          </div>

          {isSuccess ? (
            /* Success Receipt */
            <div className="p-5 bg-tertiary/10 border border-tertiary/30 rounded-DEFAULT space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface">
                {activeMode === 'buy'
                  ? 'Property Acquisition Executed'
                  : 'Commercial Lease Agreement Executed'}
              </h3>
              <p className="text-xs text-outline max-w-md mx-auto">
                {activeMode === 'buy'
                  ? `Successfully acquired ${
                      buyType === 'full'
                        ? '100% Full Ownership'
                        : `${tokenQty} Fractional Tokens`
                    } of ${property.name}. Certified on Swiss DLT Cadastre.`
                  : `Lease contract successfully registered for ${leaseTerm} months at $${effectiveMonthlyRent.toLocaleString()}/mo.`}
              </p>
              <div className="p-2.5 bg-surface rounded text-[11px] text-outline border border-border-hairline text-left space-y-1">
                <div>Contract: <strong>{property.legalEntity}</strong></div>
                <div>Cadastre SPV: <strong>{property.spvCode}</strong></div>
                <div>Settlement Tx: <span className="text-primary">{receiptTx}</span></div>
              </div>
              <Button
                variant="default"
                onClick={onClose}
                className="w-full bg-primary text-on-primary font-mono text-xs font-semibold cursor-pointer"
              >
                Close &amp; View Portfolio
              </Button>
            </div>
          ) : activeMode === 'buy' ? (
            /* BUY FLOW */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold block">
                  Acquisition Scale:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyType('tokens')}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                      buyType === 'tokens'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-hairline bg-surface text-on-surface'
                    }`}
                  >
                    <div className="font-bold">Fractional SPV Tokens</div>
                    <div className="text-[10px] text-outline mt-0.5">
                      ${tokenPrice} USD per Token
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
                    <div className="font-bold">100% Full Buyout</div>
                    <div className="text-[10px] text-outline mt-0.5">
                      ${property.valuation.toLocaleString()} USD
                    </div>
                  </button>
                </div>
              </div>

              {buyType === 'tokens' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-outline uppercase font-semibold flex justify-between">
                    <span>Token Quantity:</span>
                    <span className="text-primary font-bold">{tokenQty} Tokens</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setTokenQty(qty)}
                        className={`py-1.5 px-2 text-center rounded border font-mono text-xs cursor-pointer ${
                          tokenQty === qty
                            ? 'border-primary bg-primary text-on-primary font-bold'
                            : 'border-border-hairline bg-surface text-on-surface'
                        }`}
                      >
                        {qty} TKNS
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold block">
                  Funding Source:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFundingSource('cash')}
                    className={`p-2 rounded border flex items-center justify-between cursor-pointer ${
                      fundingSource === 'cash'
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border-hairline bg-surface text-on-surface'
                    }`}
                  >
                    <span>USD Cash Balance</span>
                    <span className="text-[10px] text-tertiary">Available</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFundingSource('usdc')}
                    className={`p-2 rounded border flex items-center justify-between cursor-pointer ${
                      fundingSource === 'usdc'
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border-hairline bg-surface text-on-surface'
                    }`}
                  >
                    <span>USDC Web3 Pot</span>
                    <span className="text-[10px] text-tertiary">Instant</span>
                  </button>
                </div>
              </div>

              {/* Order Cost & Yield Summary */}
              <div className="p-3 bg-surface-container rounded border border-border-hairline space-y-1.5">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Gross Consideration:</span>
                  <span className="font-bold text-on-surface">
                    ${totalBuyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Net Rental APY:</span>
                  <span className="text-tertiary font-bold">{property.netRentalYieldApy}% APY</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Projected Annual Net Yield:</span>
                  <span className="text-tertiary font-bold">
                    +${estimatedAnnualYield.toLocaleString('en-US', { minimumFractionDigits: 2 })} / yr
                  </span>
                </div>
                <div className="flex justify-between text-outline text-[10px] pt-1 border-t border-border-hairline">
                  <span>Swiss Cadastre Notary Fee:</span>
                  <span>0.00% (Institutional Zero-Fee)</span>
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
                    <span>Transacting on Land Registry...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Authorize Acquisition &amp; Mint Tokens</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* RENT FLOW */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold block">
                  Commercial Space Tier:
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-surface border border-border-hairline rounded text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Full Commercial Floor">Full Commercial Floor (Dedicated Reception)</option>
                  <option value="Executive Penthouse Floor">Executive Penthouse Floor &amp; Boardroom</option>
                  <option value="Ground Retail Unit">Ground Retail Unit (Street Access)</option>
                  <option value="Full Building Triple-Net">Entire Building (Master Lease)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-outline uppercase font-semibold flex justify-between">
                  <span>Lease Duration:</span>
                  <span className="text-primary font-bold">{leaseTerm} Months</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[12, 24, 36].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLeaseTerm(term)}
                      className={`p-2 text-center rounded border font-mono cursor-pointer ${
                        leaseTerm === term
                          ? 'border-primary bg-primary text-on-primary font-bold'
                          : 'border-border-hairline bg-surface text-on-surface'
                      }`}
                    >
                      <div>{term} Months</div>
                      <div className="text-[9px] opacity-80 mt-0.5">
                        {term === 36 ? '10% Rebate' : term === 24 ? '5% Rebate' : 'Standard'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lease Breakdown */}
              <div className="p-3 bg-surface-container rounded border border-border-hairline space-y-1.5">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Monthly Lease Rate:</span>
                  <span className="font-bold text-on-surface">
                    ${effectiveMonthlyRent.toLocaleString()} USD / mo
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Refundable Security Deposit (2 Mo):</span>
                  <span className="font-bold text-on-surface">
                    ${securityDeposit.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between text-outline text-[10px] pt-1 border-t border-border-hairline">
                  <span>Payment Schedule:</span>
                  <span className="text-tertiary">Automated Monthly Debit from Cash Ramp</span>
                </div>
              </div>

              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded text-[11px] text-primary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Triple-Net SLA included. Digital access keys issued upon signature.</span>
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
                    <span>Registering Lease Contract...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Sign Commercial Lease &amp; Reserve Space</span>
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
