import { describe, it, expect } from 'vitest';
import { calculatePortfolioMetrics, POSTURES } from '../../src/lib/calculator';

describe('Institutional Yield Calculation Engine', () => {
  it('correctly calculates metrics for Level 1 (Capital Preservation)', () => {
    const result = calculatePortfolioMetrics(100000, 1);

    expect(result.capital).toBe(100000);
    expect(result.blendedApy).toBe(8.6);
    expect(result.annualReturn).toBe(8600);
    expect(result.monthlyRunrate).toBe(717);
    expect(result.projectedTotalValue).toBe(108600);
    expect(result.posture.name).toBe('Capital Preservation');
    expect(result.posture.sharpeRatio).toBe(3.42);
    expect(result.posture.maxDrawdown).toBe(-1.8);
    expect(result.posture.weights[0].percentage).toBe(50);
  });

  it('correctly calculates metrics for Level 2 (Balanced Growth - Default)', () => {
    const result = calculatePortfolioMetrics(250000, 2);

    expect(result.capital).toBe(250000);
    expect(result.blendedApy).toBe(14.2);
    expect(result.annualReturn).toBe(35500);
    expect(result.monthlyRunrate).toBe(2958);
    expect(result.projectedTotalValue).toBe(285500);
    expect(result.posture.name).toBe('Balanced Growth');
    expect(result.posture.sharpeRatio).toBe(2.86);
    expect(result.posture.maxDrawdown).toBe(-3.2);
    expect(result.posture.weights[1].percentage).toBe(40);
  });

  it('correctly calculates metrics for Level 3 (Maximum Alpha)', () => {
    const result = calculatePortfolioMetrics(1000000, 3);

    expect(result.capital).toBe(1000000);
    expect(result.blendedApy).toBe(22.4);
    expect(result.annualReturn).toBe(224000);
    expect(result.monthlyRunrate).toBe(18667);
    expect(result.projectedTotalValue).toBe(1224000);
    expect(result.posture.name).toBe('Maximum Alpha');
    expect(result.posture.sharpeRatio).toBe(2.28);
    expect(result.posture.maxDrawdown).toBe(-6.4);
    expect(result.posture.weights[1].percentage).toBe(55);
  });

  it('normalizes out-of-bounds aggressiveness levels gracefully', () => {
    const minClamped = calculatePortfolioMetrics(50000, 0);
    expect(minClamped.aggressiveness).toBe(1);
    expect(minClamped.blendedApy).toBe(8.6);

    const maxClamped = calculatePortfolioMetrics(50000, 99);
    expect(maxClamped.aggressiveness).toBe(3);
    expect(maxClamped.blendedApy).toBe(22.4);
  });

  it('ensures weights total 100% across all posture profiles', () => {
    [1, 2, 3].forEach((level) => {
      const posture = POSTURES[level];
      const sum = posture.weights.reduce((acc, w) => acc + w.percentage, 0);
      expect(sum).toBe(100);
    });
  });
});
