import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AnimatedNumber } from '../../src/components/common/AnimatedNumber';
import { formatCurrency, formatPercent } from '../../src/lib/formatters';

describe('AnimatedNumber Component Unit Tests', () => {
  it('renders initial formatted string synchronously for zero-CLS and SSR integrity', () => {
    const html = renderToString(
      <AnimatedNumber
        value={250000}
        formatter={formatCurrency}
        className="font-mono text-2xl font-bold"
      />
    );

    expect(html).toContain('$250,000.00');
    expect(html).toContain('tabular-nums');
    expect(html).toContain('font-mono text-2xl font-bold');
  });

  it('correctly handles percentages with formatPercent', () => {
    const html = renderToString(
      <AnimatedNumber
        value={22.4}
        formatter={formatPercent}
        className="text-secondary"
      />
    );

    expect(html).toContain('+22.40%');
    expect(html).toContain('text-secondary');
  });

  it('supports custom formatting functions and flash flag', () => {
    const html = renderToString(
      <AnimatedNumber
        value={4667}
        formatter={(val) => `+$${Math.round(val).toLocaleString()} / Mo`}
        flashOnChange
      />
    );

    expect(html).toContain('+$4,667 / Mo');
    expect(html).toContain('tabular-nums');
  });
});
