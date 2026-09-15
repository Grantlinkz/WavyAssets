import React, { useState } from 'react';
import { Gauge, Info, CheckCircle2 } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';

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
  const driveSlots = useAlternativeStore((s) => s.driveSlots);
  const selectedLocation = useAlternativeStore((s) => s.selectedLocation);
  const setSelectedLocation = useAlternativeStore((s) => s.setSelectedLocation);
  const remainingSessions = useAlternativeStore((s) => s.remainingDriveSessions);
  const reserveSlot = useAlternativeStore((s) => s.reserveDriveSlot);

  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // Derive month and Monday-first leading cell count dynamically from driveSlots dateStr
  const firstDateParts = (driveSlots.length > 0 && driveSlots[0]?.dateStr
    ? driveSlots[0].dateStr
    : '2025-04-01'
  ).split('-');
  const slotYear = parseInt(firstDateParts[0], 10) || 2025;
  const slotMonthIndex = (parseInt(firstDateParts[1], 10) || 4) - 1;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[slotMonthIndex] || 'April';
  const monthTitle = `${monthName} ${slotYear}`;

  const firstSlotDate = new Date(Date.UTC(slotYear, slotMonthIndex, 1));
  const dayOfWeek = firstSlotDate.getUTCDay();
  const leadingEmptyCells = (dayOfWeek + 6) % 7;

  const handleDayClick = (day: number) => {
    const success = reserveSlot(day);
    if (success) {
      setBookingMessage(
        `Reserved member track drive session for ${monthTitle.split(' ')[0]} ${day}, ${firstSlotDate.getUTCFullYear()} at ${selectedLocation}.`
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
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 p-2.5 bg-surface rounded border border-border-hairline">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
              Quarterly Rental Clearance
            </span>
            <span className="text-sm font-mono text-tertiary tabular-nums font-bold block mt-0.5">
              {maskBalances ? '••••••••' : '+$8,500.00 Net'}
            </span>
            <span className="text-[11px] text-outline font-mono">
              {maskBalances ? '••••••••' : '$34,000.00 proj. annual yield'}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
              Active Verified Production Placement
            </span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-on-surface font-medium">
                Sovereign Luxury Film Campaign (Geneva)
              </span>
              <span className="text-[11px] text-tertiary font-mono px-1.5 py-0.5 bg-tertiary/10 rounded">
                Cleared &amp; Insured
              </span>
            </div>
            <span className="text-[11px] text-outline/80 font-mono block mt-0.5">
              3 Static Filming Days • Enclosed Flatbed Logistics • $0 Depreciation Assessment
            </span>
          </div>
        </div>

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

          {/* Interactive April 2025 Calendar Grid */}
          <div className="bg-surface p-3 rounded border border-border-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 text-on-surface text-xs border-b border-border-hairline gap-2">
              <span className="font-semibold font-serif">{`${monthTitle} Driving Calendar`}</span>
              <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded"></span> Available Member Slot
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

              {driveSlots.map((slot) => {
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
                if (slot.status === 'booked') {
                  return (
                    <div
                      key={slot.day}
                      title={slot.title ?? 'Booked'}
                      className="p-1.5 bg-surface-container-high text-outline rounded border border-border-hairline"
                    >
                      {String(slot.day).padStart(2, '0')}
                    </div>
                  );
                }
                return (
                  <div
                    key={slot.day}
                    className="p-1.5 bg-surface-container-low text-outline/50 rounded"
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
          onClick={() => handleDayClick(19)}
          className="px-4 py-1.5 bg-primary text-on-primary font-mono text-xs font-semibold uppercase tracking-wider rounded hover:bg-primary-container transition-colors cursor-pointer"
        >
          Reserve Concierge Drive Day
        </button>
      </div>
    </div>
  );
};
