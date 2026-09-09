import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TrustInfrastructure } from '../../src/components/trust/TrustInfrastructure';
import { ClientVoices } from '../../src/components/trust/ClientVoices';
import { CustodyNetworkGrid } from '../../src/components/trust/CustodyNetworkGrid';
import { InstitutionalFooter } from '../../src/components/footer/InstitutionalFooter';
import { NewsletterDispatch } from '../../src/components/footer/NewsletterDispatch';
import App from '../../src/App';
import { useTerminalStore } from '../../src/store/useTerminalStore';

describe('Trust Infrastructure & Compliance Integration Suite (SSR / Node 24)', () => {
  beforeEach(() => {
    useTerminalStore.setState({
      trustMode: 'institutional',
      clientTier: 'institutional',
      activeAssetId: 'crypto',
      isMegaMenuOpen: false,
    });
    window.location.hash = '';
  });

  it('renders TrustInfrastructure with tier toggle and institutional metrics', () => {
    useTerminalStore.setState({ trustMode: 'institutional' });
    const html = renderToString(<TrustInfrastructure />);

    // Section title
    expect(html).toContain('Audited Performance &amp; Sovereign Trust');

    // Institutional defaults ($12.40B, 99.999%)
    expect(html).toContain('$12.40B');
    expect(html).toContain('99.999%');
    expect(html).toContain('Sub-Minute Merkle Attestation');

    // Telemetry stream ribbon
    expect(html).toContain('TELEMETRY STREAM:');
    expect(html).toContain('sha256:d82f9...7a10e4');
    expect(html).toContain('BSI-IS-774019');
    expect(html).toContain('VERIFIED SYNC');
  });

  it('renders TrustInfrastructure in Private Wealth mode with $4.82B AUM', () => {
    const html = renderToString(<TrustInfrastructure initialTrustMode="private-wealth" />);

    expect(html).toContain('$4.82B');
    expect(html).toContain('99.998%');
    expect(html).toContain('Audited Cumulative Assets');
    expect(html).toContain('VERIFIED BY DELOITTE');
  });

  it('renders ClientVoices with 3D specular cards reactive to active tier', () => {
    // 1. Institutional mode
    const instHtml = renderToString(<ClientVoices initialTrustMode="institutional" />);

    expect(instHtml).toContain('Sheikh Tariq Al-Zahrani');
    expect(instHtml).toContain('SWF-AUH-770');
    expect(instHtml).toContain('$420M Reserve');
    expect(instHtml).toContain('Dr. Hendrik Weber');
    expect(instHtml).toContain('HFT-FRA-902');
    expect(instHtml).toContain('$310M DMA');
    expect(instHtml).toContain('Eleanor de Broglie');
    expect(instHtml).toContain('MFO-GEN-501');
    expect(instHtml).toContain('$850M Multi-Sig');

    // 2. Private Wealth mode
    const pwHtml = renderToString(<ClientVoices initialTrustMode="private-wealth" />);

    expect(pwHtml).toContain('Alexander Koenig');
    expect(pwHtml).toContain('FO-ZUR-091');
    expect(pwHtml).toContain('$68M AUM');
    expect(pwHtml).toContain('Victoria Laurent');
    expect(pwHtml).toContain('QUANT-LD4-118');
    expect(pwHtml).toContain('Marcus Thorne');
    expect(pwHtml).toContain('CORP-DXB-404');
  });

  it('renders CustodyNetworkGrid with all 6 synchronized clearing nodes', () => {
    const html = renderToString(<CustodyNetworkGrid />);

    expect(html).toContain('6/6 NODES SYNCHRONIZED');
    expect(html).toContain('data-testid="custody-node-bny"');
    expect(html).toContain('BNY MELLON');
    expect(html).toContain('Tri-Party Custody');

    expect(html).toContain('data-testid="custody-node-state-street"');
    expect(html).toContain('STATE STREET');

    expect(html).toContain('data-testid="custody-node-lgt"');
    expect(html).toContain('LGT BANK SCHWEIZ');

    expect(html).toContain('data-testid="custody-node-equinix"');
    expect(html).toContain('EQUINIX NY4 / LD4');

    expect(html).toContain('data-testid="custody-node-lloyds"');
    expect(html).toContain("LLOYD&#x27;S OF LONDON");

    expect(html).toContain('data-testid="custody-node-dtcc"');
    expect(html).toContain('DTCC DIRECT');
  });

  it('renders NewsletterDispatch with input, PGP notice, and institutional email placeholder', () => {
    const html = renderToString(<NewsletterDispatch />);

    expect(html).toContain('Institutional Dispatch');
    expect(html).toContain('allocator@familyoffice.ch');
    expect(html).toContain('Encrypted PGP dispatch. Whitelisted institutional emails only.');
    expect(html).toContain('Join');
  });

  it('renders InstitutionalFooter with RIA badges, 7 verticals, and regulatory disclaimers', () => {
    const html = renderToString(<InstitutionalFooter />);

    // Brand and Regulatory RIA
    expect(html).toContain('WAVYASSETS');
    expect(html).toContain('SEC REGISTERED RIA 801-128491');
    expect(html).toContain('FINMA REGULATED VQF SWITZERLAND');
    expect(html).toContain('MAS EXEMPT OPERATOR');

    // 7 Verticals
    expect(html).toContain('Crypto Yields &amp; Cold Storage');
    expect(html).toContain('19.4% APY');
    expect(html).toContain('Global Stocks &amp; DMA Equities');
    expect(html).toContain('AI Systematic Funds &amp; H100 Mesh');
    expect(html).toContain('Fractional Prime Real Estate');
    expect(html).toContain('Exotic Hypercars Inventory (38 Units)');
    expect(html).toContain('VIP Concierge Titanium Cards');
    expect(html).toContain('Sovereign Treasury Wallet &amp; Rails');

    // Mandatory Regulatory Disclaimers
    expect(html).toContain('REGULATORY DISCLOSURES &amp; FIDUCIARY GOVERNANCE:');
    expect(html).toContain('NO SOLICITATION &amp; RISK NOTICE:');
    expect(html).toContain('SEC Rule 206(4)-1');
    expect(html).toContain('GDPR &amp; FADP Compliant');
    expect(html).toContain('Institutional Order Engine');
  });

  it('renders complete App command deck with Trust Infrastructure and Institutional Footer integrated', () => {
    const html = renderToString(<App />);

    expect(html).toContain('data-testid="trust-infrastructure-section"');
    expect(html).toContain('data-testid="client-voices-section"');
    expect(html).toContain('data-testid="institutional-footer"');
  });
});
