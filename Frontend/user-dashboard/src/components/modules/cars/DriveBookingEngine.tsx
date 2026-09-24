import React, { useState, useMemo } from 'react';
import { Gauge, Info, CheckCircle2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { EXOTIC_ASSETS } from '../../../lib/alternativeAssetData';

const LOCATIONS = [
  'Monaco GP Circuit',
  'Zurich Alps Tour',
  'Circuit Paul Ricard',
];

interface DriveBookingEngineProps {
  maskBalances?: boolean;
}

export const DriveBookingEngine: React.FC<DriveBookingEngineProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const storeHoldings = useAlternativeStore((s) => s.userVehicleHoldings);
  const userHoldings = Object.keys(storeHoldings).length > 0 ? storeHoldings : useAlternativeStore.getState().userVehicleHoldings;
  const selectedLocation = useAlternativeStore((s) => s.selectedLocation);
  const setSelectedLocation = useAlternativeStore((s) => s.setSelectedLocation);
  const remainingSessions = useAlternativeStore((s) => s.remainingDriveSessions);
  const reserveSlot = useAlternativeStore((s) => s.reserveDriveSlot);

  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // Dynamic calendar current month/year state
  const now = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    () => new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [reservedSlotsMap, setReservedSlotsMap] = useState<Record<string, boolean>>({});

  // Placements pagination and sorting
  const [placementPage, setPlacementPage] = useState(1);
  const [placementSortOrder, setPlacementSortOrder] = useState<'asc' | 'desc'>('desc');

  const { totalValuation, activeAssetTitle, placements } = useMemo(() => {
    let total = 0;
    let firstTitle = '';
    const list: Array<{
      id: string;
      assetTitle: string;
      type: string;
      placement: string;
      venue: string;
      yield: number;
      details: string;
    }> = [];

    Object.entries(userHoldings).forEach(([assetId, holding]) => {
      const asset = EXOTIC_ASSETS.find((a) => a.id === assetId);
      if (!asset) return;

      let buyVal = 0;
      if (holding.owned || (holding.totalInvested && holding.totalInvested > 0)) {
        buyVal = holding.purchaseType === 'fractional'
          ? holding.totalInvested || ((holding.fractionalPct || 100) / 100) * asset.fairMarketValue
          : asset.fairMarketValue;
        if (!firstTitle) firstTitle = asset.title;

        list.push({
          id: `placement-${assetId}`,
          assetTitle: asset.title,
          type: 'Verified Commercial Placement',
          placement: `${asset.title} — Luxury Film Campaign (${asset.vaultLocation.split(' ')[0]})`,
          venue: asset.vaultLocation,
          yield: Math.round(buyVal * 0.01),
          details: '3 Static Filming Days • Enclosed Flatbed Logistics • $0 Depreciation Assessment',
        });
      }

      const leaseVal = (holding.leases || []).reduce((sum, l) => sum + (l.cost || 0), 0);
      if (leaseVal > 0 && !firstTitle) firstTitle = asset.title;

      (holding.leases || []).forEach((lease) => {
        list.push({
          id: `lease-placement-${lease.id}`,
          assetTitle: asset.title,
          type: `${lease.duration} Concours Lease`,
          placement: `${asset.title} — VIP Club Showcase (${asset.vaultLocation.split(' ')[0]})`,
          venue: asset.vaultLocation,
          yield: Math.round(lease.cost * 0.25),
          details: 'VIP Staging • Insured Road Transport • Full Detailing Protocol',
        });
      });

      total += buyVal + leaseVal;
    });

    return { totalValuation: total, activeAssetTitle: firstTitle, placements: list };
  }, [userHoldings]);

  const quarterlyYield = Math.round(totalValuation * 0.01);
  const annualYield = quarterlyYield * 4;

  const sortedPlacements = useMemo(() => {
    return [...placements].sort((a, b) => {
      return placementSortOrder === 'asc' ? a.yield - b.yield : b.yield - a.yield;
    });
  }, [placements, placementSortOrder]);

  const totalPlacementPages = Math.max(1, sortedPlacements.length);
  const safePlacementPage = Math.min(placementPage, totalPlacementPages);
  const currentPlacement = sortedPlacements[safePlacementPage - 1];

  // Month navigation calculation
  const monthYearYear = currentMonthDate.getFullYear();
  const monthYearIndex = currentMonthDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[monthYearIndex];
  const monthTitle = `${monthName} ${monthYearYear}`;

  const daysInMonth = new Date(monthYearYear, monthYearIndex + 1, 0).getDate();
  const firstSlotDate = new Date(Date.UTC(monthYearYear, monthYearIndex, 1));
  const dayOfWeek = firstSlotDate.getUTCDay();
  const leadingEmptyCells = (dayOfWeek + 6) % 7;

  const dynamicMonthSlots = useMemo(() => {
    return Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const slotKey = `${monthYearYear}-${String(monthYearIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      if (reservedSlotsMap[slotKey]) {
        return {
          day: dayNum,
          status: 'booked' as const,
          title: `Member Session — ${selectedLocation}`,
        };
      }

      // Guaranteed > 70% available member slot share (e.g. only 4 days out of 30 non-available)
      if (dayNum === 7 || dayNum === 21) {
        return {
          day: dayNum,
          status: 'maintenance' as const,
          title: 'Fiduciary Maintenance',
        };
      }
      if (dayNum === 4 || dayNum === 18) {
        return {
          day: dayNum,
          status: 'booked' as const,
          title: 'Concours Booked',
        };
      }
      return {
        day: dayNum,
        status: 'available' as const,
        title: 'Available Member Slot',
      };
    });
  }, [daysInMonth, monthYearYear, monthYearIndex, reservedSlotsMap, selectedLocation]);

  const handlePrevMonth = () => {
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const slotKey = `${monthYearYear}-${String(monthYearIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const slot = dynamicMonthSlots.find((s) => s.day === day);
    if (!slot || slot.status !== 'available') {
      setBookingMessage('Slot unavailable or under maintenance.');
      setTimeout(() => setBookingMessage(null), 5000);
      return;
    }
    if (remainingSessions <= 0) {
      setBookingMessage('Slot unavailable or no remaining complimentary drive sessions.');
      setTimeout(() => setBookingMessage(null), 5000);
      return;
    }
    const success = reserveSlot(day);
    if (success) {
      setReservedSlotsMap((prev) => ({ ...prev, [slotKey]: true }));
      setBookingMessage(
        `Reserved member track drive session for ${monthName} ${day}, ${monthYearYear} at ${selectedLocation}.`
      );
    } else {
      setBookingMessage('Slot unavailable or no remaining complimentary drive sessions.');
    }
    setTimeout(() => setBookingMessage(null), 5000);
  };

  return (
    <div className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary shrink-0" />
            <h3 className="font-serif font-semibold text-on-surface text-base">
              Fleet Monetization Yield &amp; Member Drive-Day Engine
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-primary/10 text-primary font-mono text-[10px] rounded uppercase tracking-wider font-semibold border border-primary/20">
            Zero Depreciation Protocol
          </span>
        </div>

        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          Autonomous fiduciary monetization protocol offsetting vault custody, insurance, and
          specialist service charges while preserving immaculate collector status.
        </p>

        {/* Revenue Readout Strip */}
        {totalValuation <= 0 ? (
          <div className="mt-3 py-6 px-4 text-center text-xs font-mono text-outline bg-surface rounded border border-dashed border-border-hairline">
            No vaulted fleet assets in active monetization protocol. Acquire or lease vehicles in Tier-1 Vaulted Tangible Assets to activate quarterly rental clearance and commercial placements.
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 p-2.5 bg-surface rounded border border-border-hairline">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
                Quarterly Rental Clearance
              </span>
              <span className="text-sm font-mono text-tertiary tabular-nums font-bold block mt-0.5">
                {maskBalances ? '••••••••' : `+$${quarterlyYield.toLocaleString('en-US', { minimumFractionDigits: 2 })} Net`}
              </span>
              <span className="text-[11px] text-outline font-mono">
                {maskBalances ? '••••••••' : `$${annualYield.toLocaleString('en-US', { minimumFractionDigits: 2 })} proj. annual yield`}
              </span>
            </div>
            <div className="md:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-outline">
                  Active Verified Production Placement ({sortedPlacements.length})
                </span>
                {sortedPlacements.length > 1 && (
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <button
                      type="button"
                      data-testid="placement-sort-btn"
                      onClick={() => setPlacementSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-container border border-border-hairline rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <ArrowUpDown className="w-3 h-3 text-primary" />
                      <span>Yield ({placementSortOrder === 'asc' ? '↑' : '↓'})</span>
                    </button>
                    <span data-testid="placement-page-info">
                      {safePlacementPage}/{totalPlacementPages}
                    </span>
                    <button
                      type="button"
                      data-testid="placement-prev-btn"
                      disabled={safePlacementPage <= 1}
                      onClick={() => setPlacementPage((p) => Math.max(1, p - 1))}
                      className="p-0.5 bg-surface-container border border-border-hairline rounded disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      data-testid="placement-next-btn"
                      disabled={safePlacementPage >= totalPlacementPages}
                      onClick={() => setPlacementPage((p) => Math.min(totalPlacementPages, p + 1))}
                      className="p-0.5 bg-surface-container border border-border-hairline rounded disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-on-surface font-medium truncate max-w-[80%]">
                  {currentPlacement ? currentPlacement.placement : (activeAssetTitle ? `${activeAssetTitle} — Luxury Film Campaign (Geneva)` : 'Global Luxury Film Campaign (Geneva)')}
                </span>
                <span className="text-[11px] text-tertiary font-mono px-1.5 py-0.5 bg-tertiary/10 rounded shrink-0">
                  Cleared &amp; Insured
                </span>
              </div>
              <span className="text-[11px] text-outline/80 font-mono block mt-0.5">
                {currentPlacement ? currentPlacement.details : '3 Static Filming Days • Enclosed Flatbed Logistics • $0 Depreciation Assessment'}
              </span>
            </div>
          </div>
        )}

        {/* Drive-Day Booking Sub-System */}
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <span className="font-mono text-xs text-on-surface font-semibold uppercase tracking-wider">
                Member Privilege: Concours &amp; Track Drive Days
              </span>
              <span className="text-outline text-xs ml-2">
                ({remainingSessions} Complimentary Sessions Remaining this Year)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-outline">Venue:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-surface border border-border-hairline text-on-surface text-xs rounded px-2 py-1 focus:ring-1 focus:ring-primary font-mono cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {bookingMessage && (
            <div className="p-2 mb-2 bg-primary/10 border border-primary/30 text-primary text-xs font-mono rounded flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>{bookingMessage}</span>
            </div>
          )}

          {/* Interactive Dynamic Calendar Grid */}
          <div className="bg-surface p-3 rounded border border-border-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 text-on-surface text-xs border-b border-border-hairline gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold font-serif text-sm">{`${monthTitle} Driving Calendar`}</span>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <button
                    type="button"
                    data-testid="calendar-prev-month-btn"
                    onClick={handlePrevMonth}
                    className="p-1 rounded bg-surface-container hover:bg-surface-container-high border border-border-hairline cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    data-testid="calendar-next-month-btn"
                    onClick={handleNextMonth}
                    className="p-1 rounded bg-surface-container hover:bg-surface-container-high border border-border-hairline cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded"></span> Available Member Slot (&gt;70%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-surface-container-high rounded border border-border-hairline"></span>{' '}
                  Concours Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-tertiary rounded"></span> Maintenance
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px]">
              <span className="text-outline py-1">MON</span>
              <span className="text-outline py-1">TUE</span>
              <span className="text-outline py-1">WED</span>
              <span className="text-outline py-1">THU</span>
              <span className="text-outline py-1">FRI</span>
              <span className="text-outline py-1">SAT</span>
              <span className="text-outline py-1">SUN</span>

              {/* Dynamic Monday-first leading empty cells */}
              {Array.from({ length: leadingEmptyCells }).map((_, i) => (
                <div key={`empty-day-${i}`} className="p-1.5" />
              ))}

              {dynamicMonthSlots.map((slot) => {
                if (slot.status === 'available') {
                  return (
                    <button
                      key={slot.day}
                      type="button"
                      onClick={() => handleDayClick(slot.day)}
                      title={slot.title ?? 'Click to Reserve'}
                      className="p-1.5 bg-primary text-on-primary font-bold rounded cursor-pointer hover:bg-primary-container shadow-sm transition-transform active:scale-95"
                    >
                      {String(slot.day).padStart(2, '0')}
                    </button>
                  );
                }
                if (slot.status === 'maintenance') {
                  return (
                    <div
                      key={slot.day}
                      title={slot.title ?? 'Fiduciary Maintenance'}
                      className="p-1.5 bg-tertiary/20 text-tertiary rounded font-semibold border border-tertiary/30"
                    >
                      {String(slot.day).padStart(2, '0')}
                    </div>
                  );
                }
                return (
                  <div
                    key={slot.day}
                    title={slot.title ?? 'Booked'}
                    className="p-1.5 bg-surface-container-high text-outline rounded border border-border-hairline"
                  >
                    {String(slot.day).padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action & Terms Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-hairline">
        <div className="flex items-center gap-3 text-[11px] text-outline font-mono flex-wrap">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
            White-Glove Enclosed Hauler
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
            Porsche Classic Pit Technician
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
            $2M Track Umbrella Policy
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const firstAvail = dynamicMonthSlots.find((s) => s.status === 'available');
            if (firstAvail) handleDayClick(firstAvail.day);
          }}
          className="px-4 py-1.5 bg-primary text-on-primary font-mono text-xs font-semibold uppercase tracking-wider rounded hover:bg-primary-container transition-colors cursor-pointer"
        >
          Reserve Concierge Drive Day
        </button>
      </div>
    </div>
  );
};
