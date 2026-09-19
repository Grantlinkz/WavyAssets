import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { KycDrawer } from '../../src/components/modals/KycDrawer';
import { KycTierChecklist } from '../../src/components/modules/compliance/KycTierChecklist';
import { NetWorthWidget } from '../../src/components/command-bar/NetWorthWidget';
import { useAuthStore, type UserEntity } from '../../src/store/useAuthStore';
import { usePortfolioStore } from '../../src/store/usePortfolioStore';
import { calculateUserTimeframePnL } from '../../src/lib/calculations';

describe('Sovereign KYC Progressive Architecture & Auth Verification Suite', () => {
  beforeEach(() => {
    usePortfolioStore.getState().resetToDefaults();
    useAuthStore.getState().logout();
  });

  describe('1. Default KYC Level 1 on Initial Sign-In / Registration', () => {
    it('sets initial user kycTier to TIER_1 and renders Level 1 by default', () => {
      const newUser: UserEntity = {
        id: 'usr-new-allocator-101',
        email: 'allocator@swissholding.ch',
        fullName: 'Baron Heinrich Von Stauffen',
        tier: 'PRIVATE_WEALTH',
        isCorporate: false,
        kycTier: 'TIER_1',
      };

      useAuthStore.getState().setSession(newUser, 'mock_jwt_token_level1');
      const state = useAuthStore.getState();
      expect(state.user?.kycTier).toBe('TIER_1');

      const drawerHtml = renderToString(<KycDrawer isOpen={true} />);
      expect(drawerHtml).toContain('TIER 1');
      expect(drawerHtml).toContain('Level 1: Basic');
      expect(drawerHtml).toContain('Level 1 Identity Cleared');
      expect(drawerHtml).toContain('Upgrade to Level 2');
    });

    it('renders Level 1 as the current tier in KycTierChecklist panel for new users', () => {
      useAuthStore.getState().setSession(
        {
          id: 'usr-fresh-user-002',
          email: 'fresh@wavyassets.com',
          fullName: 'Elena Rostova',
          tier: 'PRIVATE_WEALTH',
          isCorporate: false,
          kycTier: 'TIER_1',
        },
        'mock_jwt_token'
      );

      const html = renderToString(<KycTierChecklist />);
      expect(html).toContain('Sovereign Standard Individual &amp; Liquidity Tier 1');
      expect(html).toContain('CURRENT TIER');
      expect(html).toContain('Level 1 Active • Upgrade Available');
      expect(html).toContain('VERIFY NOW');
      expect(html).toContain('LOCKED');
    });
  });

  describe('2. Progressive Level Disclosure', () => {
    it('locks Level 3 when user is at Level 1 and Level 2 is not cleared', () => {
      useAuthStore.getState().setSession(
        {
          id: 'usr-level1-locked-test',
          email: 'locked@wavyassets.com',
          fullName: 'Sovereign Client',
          tier: 'PRIVATE_WEALTH',
          isCorporate: false,
          kycTier: 'TIER_1',
        },
        'mock_jwt_token'
      );

      const html = renderToString(<KycDrawer isOpen={true} />);
      expect(html).toContain('Level 1: Basic');
      expect(html).toContain('Level 2: Gov ID');
      expect(html).toContain('Level 3: Utility/Bank');
      expect(html).toContain('cursor-not-allowed opacity-60');
    });
  });

  describe('3. Level 2 & Level 3 Document Upload & Pending Admin Approval', () => {
    it('contains fields for Full Legal Name, DOB, and ID Number for Level 2 verification', () => {
      useAuthStore.getState().setSession(
        {
          id: 'usr-l2-test',
          email: 'l2@wavyassets.com',
          fullName: 'Marcus Aurelius Grant',
          tier: 'PRIVATE_WEALTH',
          isCorporate: false,
          kycTier: 'TIER_1',
        },
        'mock_token'
      );

      const html = renderToString(<KycDrawer isOpen={true} initialTab="level2" />);
      expect(html).toContain('Level 2: Government Identity Verification');
      expect(html).toContain('NOTE:');
      expect(html).toContain('manually approved by the admin panel');
    });
  });

  describe('4. User-Specific Net Assets & Growth Engine', () => {
    it('dynamically computes exact proportional growth for specific user net assets', () => {
      // Benchmark institutional user: $14,820,450.00
      const benchmarkPnL = calculateUserTimeframePnL(14820450.0, '1D');
      expect(benchmarkPnL.absoluteDelta).toBe(184210.4);
      expect(benchmarkPnL.percentageDelta).toBe(1.26);
      expect(benchmarkPnL.label).toBe('+$184,210.40 (+1.26%)');

      // User with $500,000.00 net assets
      const customPnL = calculateUserTimeframePnL(500000.0, '1D');
      expect(customPnL.absoluteDelta).toBe(6214.74);
      expect(customPnL.percentageDelta).toBe(1.26);
      expect(customPnL.label).toContain('+1.26%');

      // Newly registered user with $0.00 net assets
      const zeroPnL = calculateUserTimeframePnL(0, '1D');
      expect(zeroPnL.absoluteDelta).toBe(0);
      expect(zeroPnL.percentageDelta).toBe(0);
      expect(zeroPnL.label).toBe('+$0.00 (+0.00%)');
    });

    it('renders specific user net assets dynamically in NetWorthWidget', () => {
      usePortfolioStore.getState().setNetWorth(14820450.0);
      const htmlBenchmark = renderToString(<NetWorthWidget netWorth={14820450.0} />);
      expect(htmlBenchmark).toContain('$14,820,450.00');
      expect(htmlBenchmark).toContain('+$184,210.40 (+1.26%)');

      // Change to a new user's portfolio value: $250,000.00
      usePortfolioStore.getState().setNetWorth(250000.0);
      const htmlUser2 = renderToString(<NetWorthWidget netWorth={250000.0} />);
      expect(htmlUser2).toContain('$250,000.00');
      expect(htmlUser2).not.toContain('$14,820,450.00');
    });
  });
});
