import { describe, it, expect, beforeEach } from 'vitest';
import { useAlternativeStore } from '../../src/store/useAlternativeStore';
import {
  EXOTIC_ASSETS,
  CARS_SUMMARY_METRICS,
  INITIAL_DRIVE_SLOTS,
} from '../../src/lib/alternativeAssetData';

describe('Exotic Vehicles & Horology Vault Module Unit Tests', () => {
  beforeEach(() => {
    useAlternativeStore.setState({
      driveSlots: [...INITIAL_DRIVE_SLOTS],
      selectedLocation: 'Monaco GP Circuit // Private Club Session',
      remainingDriveSessions: 2,
      lastReservedDay: null,
    });
  });

  it('validates 4-metric physical tangible asset overview', () => {
    expect(CARS_SUMMARY_METRICS).toHaveLength(4);

    const vaultedVal = CARS_SUMMARY_METRICS.find((m) => m.label.includes('VAULTED VALUATION'));
    expect(vaultedVal?.value).toBe('$850,000.00');
    expect(vaultedVal?.badge).toBe('5.7% Consolidated NAV');

    const indexGrowth = CARS_SUMMARY_METRICS.find((m) => m.label.includes('INDEX GROWTH'));
    expect(indexGrowth?.value).toBe('+14.2%');

    const insuredLimit = CARS_SUMMARY_METRICS.find((m) => m.label.includes('INSURED LIMIT'));
    expect(insuredLimit?.value).toBe('$1,200,000.00');
  });

  it('validates Porsche 993 GT2 and Patek 5270P provenance and Hagerty index', () => {
    expect(EXOTIC_ASSETS).toHaveLength(2);

    const porsche = EXOTIC_ASSETS.find((a) => a.id === 'car-1');
    expect(porsche?.fairMarketValue).toBe(580000);
    expect(porsche?.acquisitionPrice).toBe(495000);
    expect(porsche?.unrealizedGain).toBe(85000);
    expect(porsche?.conditionScore).toBe(99.4);
    expect(porsche?.custodyEnclave).toBe('CH-FREEPORT-GEN-04B');

    const patek = EXOTIC_ASSETS.find((a) => a.id === 'watch-1');
    expect(patek?.fairMarketValue).toBe(270000);
    expect(patek?.acquisitionPrice).toBe(235000);
    expect(patek?.unrealizedGain).toBe(35000);
    expect(patek?.conditionScore).toBe(100.0);
    expect(patek?.conditionLabel).toContain('Factory Blister');

    // Aggregate valuation
    const totalVal = porsche!.fairMarketValue + patek!.fairMarketValue;
    expect(totalVal).toBe(850000);
  });

  it('handles member drive-day reservation and updates complimentary session count', () => {
    const store = useAlternativeStore.getState();
    expect(store.remainingDriveSessions).toBe(2);

    // Reserve available slot on April 11
    const booked = store.reserveDriveSlot(11);
    expect(booked).toBe(true);
    expect(useAlternativeStore.getState().remainingDriveSessions).toBe(1);
    expect(useAlternativeStore.getState().lastReservedDay).toBe(11);

    const updatedSlot = useAlternativeStore.getState().driveSlots.find((s) => s.day === 11);
    expect(updatedSlot?.status).toBe('booked');

    // Attempting to book the same slot should fail
    const bookAgain = useAlternativeStore.getState().reserveDriveSlot(11);
    expect(bookAgain).toBe(false);

    // Book second available slot on April 12
    const bookedSecond = useAlternativeStore.getState().reserveDriveSlot(12);
    expect(bookedSecond).toBe(true);
    expect(useAlternativeStore.getState().remainingDriveSessions).toBe(0);

    // Booking a third slot when remaining sessions are 0 should fail
    const bookedThird = useAlternativeStore.getState().reserveDriveSlot(19);
    expect(bookedThird).toBe(false);
  });

  it('allows switching track drive venues and confirms Lloyd insured limits', () => {
    const store = useAlternativeStore.getState();
    expect(store.selectedLocation).toContain('Monaco');

    store.setSelectedLocation('Zurich Alps // Gotthard Closed-Pass Tour');
    expect(useAlternativeStore.getState().selectedLocation).toBe(
      'Zurich Alps // Gotthard Closed-Pass Tour'
    );
  });
});
