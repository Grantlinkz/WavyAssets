import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  Award,
  Building,
  FileText,
  X,
  Lock,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useAuthStore } from '../../store/useAuthStore';
import { uploadDossierDocument, fetchComplianceStatus } from '../../lib/api';

export interface KycDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTab?: 'level1' | 'level2' | 'level3';
}

interface KycSubmissions {
  level2?: {
    fileName: string;
    submittedAt: string;
    status: 'PENDING_APPROVAL' | 'APPROVED';
  };
  level3?: {
    docCategory: 'UTILITY_BILL' | 'BANK_STATEMENT';
    fileName: string;
    submittedAt: string;
    status: 'PENDING_APPROVAL' | 'APPROVED';
  };
}

export const KycDrawer: React.FC<KycDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propClose,
  initialTab: propInitialTab,
}) => {
  const storeModal = usePortfolioStore((s) => s.activeModal);
  const storeClose = usePortfolioStore((s) => s.closeModal);
  const user = useAuthStore((s) => s.user);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeModal === 'kyc';
  const closeModal = propClose !== undefined ? propClose : storeClose;

  const userId = user?.id || 'guest';

  // Submissions state
  const [submissions, setSubmissions] = useState<KycSubmissions>({});

  // Active level tab
  const [activeTab, setActiveTab] = useState<'level1' | 'level2' | 'level3'>(
    propInitialTab ?? 'level1'
  );

  // Level 2 Form State
  const [l2FullName, setL2FullName] = useState('');
  const [l2Dob, setL2Dob] = useState('');
  const [l2IdNumber, setL2IdNumber] = useState('');
  const [l2File, setL2File] = useState<File | null>(null);
  const [l2Attested, setL2Attested] = useState(false);
  const [l2Error, setL2Error] = useState<string | null>(null);
  const [l2Submitting, setL2Submitting] = useState(false);

  // Level 3 Form State
  const [l3Category, setL3Category] = useState<'UTILITY_BILL' | 'BANK_STATEMENT'>('UTILITY_BILL');
  const [l3Provider, setL3Provider] = useState('');
  const [l3Address, setL3Address] = useState('');
  const [l3BillDate, setL3BillDate] = useState('');
  const [l3File, setL3File] = useState<File | null>(null);
  const [l3Attested, setL3Attested] = useState(false);
  const [l3Error, setL3Error] = useState<string | null>(null);
  const [l3Submitting, setL3Submitting] = useState(false);

  // Server-fetched compliance status as source of truth
  const [serverCompliance, setServerCompliance] = useState<{
    currentTier: string;
    requirements?: Array<{ tier: string; isMet: boolean }>;
    documents?: Array<{ id: string; docType: string; isVerified: boolean }>;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchComplianceStatus()
      .then((res: unknown) => {
        if (!isMounted || !res) return;
        const resObj = res as Record<string, unknown>;
        const data = (resObj.data !== undefined ? resObj.data : resObj) as {
          currentTier?: string;
          kycTier?: string;
          requirements?: Array<{ tier: string; isMet: boolean }>;
          documents?: Array<{ id: string; docType: string; isVerified: boolean }>;
        };
        if (data && typeof data === 'object') {
          const tier = data.kycTier || data.currentTier || 'TIER_1';
          setServerCompliance({
            currentTier: tier,
            requirements: data.requirements,
            documents: data.documents,
          });
          if (tier) {
            useAuthStore.getState().updateUserKycTier(tier as 'TIER_1' | 'TIER_2' | 'TIER_3');
          }
          if (Array.isArray(data.documents)) {
            const l2Doc = data.documents.find((d) => d.docType === 'PASSPORT' || d.docType === 'GOVERNMENT_ID');
            const l3Doc = data.documents.find((d) => d.docType === 'UTILITY_BILL' || d.docType === 'BANK_STATEMENT');
            setSubmissions({
              level2: l2Doc
                ? {
                    fileName: 'Government_ID_Verified.pdf',
                    submittedAt: new Date().toISOString(),
                    status: l2Doc.isVerified ? 'APPROVED' : 'PENDING_APPROVAL',
                  }
                : undefined,
              level3: l3Doc
                ? {
                    docCategory: 'UTILITY_BILL',
                    fileName: 'Proof_Of_Address.pdf',
                    submittedAt: new Date().toISOString(),
                    status: l3Doc.isVerified ? 'APPROVED' : 'PENDING_APPROVAL',
                  }
                : undefined,
            });
          }
        }
      })
      .catch(() => {
        // Fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update submission status in component state without localStorage
  const saveSubmissions = (updated: KycSubmissions) => {
    setSubmissions(updated);
  };

  // Determine Level Statuses strictly from verified KYC documents:
  // Level 1: Passed automatically upon OTP / email verification.
  // Level 2: Gov ID MUST NOT pass without going through KYC upload & admin review.
  const hasServerVerifiedL2Doc = Boolean(
    serverCompliance?.documents?.some(
      (d) => (d.docType === 'PASSPORT' || d.docType === 'GOVERNMENT_ID') && d.isVerified
    ) || serverCompliance?.requirements?.find((r) => r.tier === 'TIER_2')?.isMet
  );
  const hasServerVerifiedL3Doc = Boolean(
    serverCompliance?.documents?.some(
      (d) =>
        (d.docType === 'UTILITY_BILL' ||
          d.docType === 'BANK_STATEMENT' ||
          d.docType === 'ARTICLES_OF_INC' ||
          d.docType === 'SOURCE_OF_WEALTH') &&
        d.isVerified
    ) || serverCompliance?.requirements?.find((r) => r.tier === 'TIER_3')?.isMet
  );

  const isLevel2Approved = hasServerVerifiedL2Doc || submissions.level2?.status === 'APPROVED';
  const isLevel2Pending = !isLevel2Approved && submissions.level2?.status === 'PENDING_APPROVAL';

  const isLevel3Approved = isLevel2Approved && (hasServerVerifiedL3Doc || submissions.level3?.status === 'APPROVED');
  const isLevel3Pending = !isLevel3Approved && submissions.level3?.status === 'PENDING_APPROVAL';
  const isLevel3Locked = !isLevel2Approved; // Level 3 is strictly locked until Level 2 has been approved

  const effectiveTier = isLevel3Approved ? 'TIER_3' : isLevel2Approved ? 'TIER_2' : 'TIER_1';

  const effectiveFullName = (l2FullName || user?.fullName || '').trim();

  // Handle Level 2 Submission
  const handleLevel2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setL2Error(null);

    if (!effectiveFullName || effectiveFullName.length < 2) {
      setL2Error('Please enter your full legal name as it appears on your ID.');
      return;
    }
    if (!l2Dob.trim()) {
      setL2Error('Please enter your date of birth (DOB).');
      return;
    }
    if (!l2IdNumber.trim() || l2IdNumber.trim().length < 4) {
      setL2Error('Please enter a valid government ID number.');
      return;
    }
    if (!l2File) {
      setL2Error('Please select your Government ID document file (PDF or Image).');
      return;
    }
    if (!l2Attested) {
      setL2Error('Please certify that your name, DOB, ID number and all details are clear and legible.');
      return;
    }

    setL2Submitting(true);
    try {
      await uploadDossierDocument({
        docType: 'PASSPORT',
        file: l2File,
        fullName: effectiveFullName,
        dob: l2Dob.trim(),
        idNumber: l2IdNumber.trim(),
        notes: `Government ID upload: ${effectiveFullName} | DOB: ${l2Dob} | ID Number: ${l2IdNumber.trim()}`,
      });

      const updatedSubmissions: KycSubmissions = {
        ...submissions,
        level2: {
          fileName: l2File.name,
          submittedAt: new Date().toISOString(),
          status: 'PENDING_APPROVAL',
        },
      };
      saveSubmissions(updatedSubmissions);
      setL2Submitting(false);
    } catch (err: unknown) {
      setL2Submitting(false);
      setL2Error(err instanceof Error ? err.message : 'Failed to upload Government ID document to server.');
      return;
    }
  };

  // Handle Level 3 Submission with <3 months verification
  const handleLevel3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setL3Error(null);

    if (isLevel3Locked) {
      setL3Error('Level 3 is locked. You must complete Level 2 verification first.');
      return;
    }
    if (!l3Provider.trim()) {
      setL3Error('Please enter the utility provider or bank name.');
      return;
    }
    if (!l3Address.trim() || l3Address.trim().length < 5) {
      setL3Error('Please enter your full billing / residential address.');
      return;
    }
    if (!l3BillDate) {
      setL3Error('Please enter the document issue date.');
      return;
    }

    // Verify issue date is less than 3 months old from today's date
    const today = new Date();
    const issueDate = new Date(l3BillDate);
    if (isNaN(issueDate.getTime())) {
      setL3Error('Invalid issue date format.');
      return;
    }
    if (issueDate > today) {
      setL3Error('Document issue date cannot be in the future.');
      return;
    }

    // 90 days threshold (~3 months)
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const diffMs = today.getTime() - issueDate.getTime();
    if (diffMs > ninetyDaysMs) {
      setL3Error('Document issue date must be less than 3 months old from today’s date.');
      return;
    }

    if (!l3File) {
      setL3Error('Please select a utility bill or bank statement document file.');
      return;
    }
    if (!l3Attested) {
      setL3Error('Please certify that your address and provider details are clear and dated within 3 months.');
      return;
    }

    setL3Submitting(true);
    try {
      const selectedDocType = l3Category === 'UTILITY_BILL' ? 'UTILITY_BILL' : 'BANK_STATEMENT';
      await uploadDossierDocument({
        docType: selectedDocType,
        file: l3File,
        providerOrBank: l3Provider.trim(),
        billingAddress: l3Address.trim(),
        billIssueDate: l3BillDate,
        notes: `${l3Category}: ${l3Provider.trim()} | Address: ${l3Address.trim()} | Issued: ${l3BillDate}`,
      });

      const updatedSubmissions: KycSubmissions = {
        ...submissions,
        level3: {
          docCategory: l3Category,
          fileName: l3File.name,
          submittedAt: new Date().toISOString(),
          status: 'PENDING_APPROVAL',
        },
      };
      saveSubmissions(updatedSubmissions);
      setL3Submitting(false);
    } catch (err: unknown) {
      setL3Submitting(false);
      setL3Error(err instanceof Error ? err.message : 'Failed to upload address document to server.');
      return;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent data-testid="kyc-modal" className="max-w-[620px] p-0 overflow-hidden border border-border-hairline bg-surface-container-lowest">
        {/* Master Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border-hairline bg-surface-container-low flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xs border border-primary/20 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-serif font-bold uppercase tracking-wide text-on-surface">
                COMPLIANCE &amp; KYC ATTESTATION
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.2 bg-primary/15 text-primary text-[10px] font-mono font-semibold rounded-xs uppercase">
                  ACCREDITED INSTITUTIONAL
                </span>
                <span className="text-[10px] text-outline font-mono">FINMA &amp; VARA DUAL-CLEARED</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-kyc-modal"
            aria-label="Close KYC passport"
            onClick={closeModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Tier Limits Strip */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-surface-container-lowest border-b border-border-hairline text-center">
          <div className="p-2 bg-surface-container-low rounded-DEFAULT border border-border-hairline">
            <span className="block text-[10px] font-mono text-outline uppercase">Active Tier</span>
            <span className="text-xs font-mono font-bold text-primary mt-0.5 block">
              {effectiveTier.replace('_', ' ')}
            </span>
          </div>
          <div className="p-2 bg-surface-container-low rounded-DEFAULT border border-border-hairline">
            <span className="block text-[10px] font-mono text-outline uppercase">Daily Limit</span>
            <span className="text-xs font-mono font-bold text-tertiary mt-0.5 block">
              {effectiveTier === 'TIER_3' ? 'UNLIMITED' : effectiveTier === 'TIER_2' ? '$250,000' : '$10,000'}
            </span>
          </div>
          <div className="p-2 bg-surface-container-low rounded-DEFAULT border border-border-hairline">
            <span className="block text-[10px] font-mono text-outline uppercase">Monthly Wires</span>
            <span className="text-xs font-mono font-bold text-tertiary mt-0.5 block">UNLIMITED</span>
          </div>
        </div>

        {/* Progressive Level Navigation Tabs */}
        <div className="flex border-b border-border-hairline bg-surface-container text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('level1')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'level1'
                ? 'border-primary text-primary font-semibold bg-surface-container-lowest'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-tertiary" />
            <span>Level 1: Basic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('level2')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'level2'
                ? 'border-primary text-primary font-semibold bg-surface-container-lowest'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            {isLevel2Approved ? (
              <Check className="w-3.5 h-3.5 text-tertiary" />
            ) : isLevel2Pending ? (
              <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
            ) : (
              <Award className="w-3.5 h-3.5 text-outline" />
            )}
            <span>Level 2: Gov ID</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('level3')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              isLevel3Locked
                ? 'border-transparent text-outline/50 cursor-not-allowed opacity-60'
                : activeTab === 'level3'
                ? 'border-primary text-primary font-semibold bg-surface-container-lowest'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            {isLevel3Locked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : isLevel3Approved ? (
              <Check className="w-3.5 h-3.5 text-tertiary" />
            ) : isLevel3Pending ? (
              <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
            ) : (
              <Building className="w-3.5 h-3.5 text-outline" />
            )}
            <span>Level 3: Utility/Bank</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {/* TAB 1: Level 1 Basic Identity */}
          {activeTab === 'level1' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-tertiary/10 border border-tertiary/30 rounded-DEFAULT flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-tertiary shrink-0" />
                  <div>
                    <span className="font-semibold text-tertiary block">Level 1 Identity Cleared</span>
                    <span className="text-[11px] text-outline block">
                      Email authentication and session biometric tokens validated.
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-tertiary/20 text-tertiary rounded-xs text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="border border-border-hairline rounded-DEFAULT p-3 bg-surface-container-low space-y-2">
                <span className="text-[10px] text-outline uppercase tracking-wider block">Level 1 Privileges</span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-outline">Daily Liquidity Cap:</span>
                    <span className="text-on-surface font-bold">$10,000 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Portfolio Access:</span>
                    <span className="text-on-surface">Standard Liquidity Rails</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Account Profile:</span>
                    <span className="text-primary">{user?.email || 'Authenticated User'}</span>
                  </div>
                </div>
              </div>

              {!isLevel2Approved && (
                <div className="p-3 border border-primary/30 bg-primary/5 rounded-DEFAULT flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-primary block">Upgrade to Level 2</span>
                    <span className="text-[11px] text-outline block">
                      Unlock $250,000/day liquidity by uploading your Government ID.
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setActiveTab('level2')}
                    className="font-mono text-xs"
                  >
                    Proceed to Level 2 →
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Level 2 Government ID Verification */}
          {activeTab === 'level2' && (
            <div className="space-y-4 font-mono text-xs">
              {isLevel2Approved ? (
                <div className="p-4 bg-tertiary/10 border border-tertiary/30 rounded-DEFAULT space-y-2">
                  <div className="flex items-center gap-2 text-tertiary">
                    <Check className="w-5 h-5" />
                    <span className="font-bold text-sm">Level 2 Government ID Cleared</span>
                  </div>
                  <p className="text-[11px] text-outline">
                    Your Government ID has been verified and approved by the compliance administration.
                    Daily limit elevated to $250,000 USD.
                  </p>
                </div>
              ) : isLevel2Pending ? (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-DEFAULT space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-sm">Submitted — Pending Manual Approval by Admin Panel</span>
                  </div>
                  <p className="text-[11px] text-outline">
                    Your Government ID document ({submissions.level2?.fileName}) has been securely submitted.
                    Verification is manually reviewed by the administrative compliance guild. You will receive immediate notification once approved.
                  </p>
                  <div className="pt-2 text-[11px] text-outline border-t border-border-hairline space-y-1">
                    <div>Submitted: <span className="text-on-surface">{new Date(submissions.level2?.submittedAt || '').toLocaleString()}</span></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLevel2Submit} className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-sm font-serif font-bold text-on-surface block">
                      Level 2: Government Identity Verification
                    </span>
                    <p className="text-[11px] text-outline">
                      Upload your official Government ID (Passport, National ID, or Driver's License). Ensure your name, DOB, and all details are clearly legible.
                    </p>
                  </div>

                  <div className="p-2.5 bg-primary/10 border border-primary/30 text-primary text-[11px] rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span><strong>NOTE:</strong> Your document will be manually approved by the admin panel upon review.</span>
                  </div>

                  {l2Error && (
                    <div className="p-2.5 bg-error/10 border border-error/30 text-error text-[11px] rounded-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{l2Error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="kyc-fullname" className="text-[11px] text-outline block">
                        Full Legal Name:
                      </label>
                      <input
                        id="kyc-fullname"
                        type="text"
                        value={l2FullName !== '' ? l2FullName : (user?.fullName || '')}
                        onChange={(e) => setL2FullName(e.target.value)}
                        placeholder="e.g. Dr. Alexander Von Berg"
                        className="w-full h-8 px-2.5 text-xs bg-surface-container border border-border-hairline rounded-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="kyc-dob" className="text-[11px] text-outline block">
                        Date of Birth (DOB):
                      </label>
                      <input
                        id="kyc-dob"
                        type="date"
                        value={l2Dob}
                        onChange={(e) => setL2Dob(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs bg-surface-container border border-border-hairline rounded-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="kyc-idnumber" className="text-[11px] text-outline block">
                      Government ID / Passport / License Number:
                    </label>
                    <input
                      id="kyc-idnumber"
                      type="text"
                      value={l2IdNumber}
                      onChange={(e) => setL2IdNumber(e.target.value)}
                      placeholder="e.g. X12345678 or CHE-88942-A"
                      className="w-full h-8 px-2.5 text-xs bg-surface-container border border-border-hairline rounded-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="kyc-govid-file" className="text-[11px] text-outline block">
                      Upload Government ID File (PDF, PNG, JPG):
                    </label>
                    <input
                      id="kyc-govid-file"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setL2File(e.target.files?.[0] || null)}
                      className="w-full text-xs text-outline file:mr-3 file:py-1 file:px-2.5 file:rounded-xs file:border file:border-border-hairline file:bg-surface-container file:text-xs file:font-mono file:text-on-surface hover:file:bg-surface-container-high"
                    />
                  </div>

                  <label className="flex items-start gap-2 pt-1 text-[11px] text-outline cursor-pointer">
                    <input
                      type="checkbox"
                      checked={l2Attested}
                      onChange={(e) => setL2Attested(e.target.checked)}
                      className="mt-0.5 rounded-xs accent-primary"
                    />
                    <span>
                      I certify that my legal name, date of birth, ID number, and all document details are clear, legible, and uncropped.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={l2Submitting}
                    className="w-full font-mono text-xs uppercase tracking-wider"
                  >
                    {l2Submitting ? 'Submitting ID...' : 'Submit Government ID for Verification'}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: Level 3 Utility Bill or Bank Statement (<3 months old) */}
          {activeTab === 'level3' && (
            <div className="space-y-4 font-mono text-xs">
              {isLevel3Locked ? (
                <div className="p-5 border border-dashed border-border-hairline rounded-DEFAULT bg-surface-container-low text-center space-y-3">
                  <div className="mx-auto w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-on-surface block">
                      Level 3 is Locked
                    </span>
                    <p className="text-[11px] text-outline max-w-sm mx-auto mt-1">
                      In accordance with Global compliance protocols, Level 3 is only available after Level 2 Government ID verification has been completed and approved by the admin panel.
                    </p>
                  </div>
                  <Button
                    variant="goldOutline"
                    size="sm"
                    onClick={() => setActiveTab('level2')}
                    className="font-mono text-xs"
                  >
                    Complete Level 2 First →
                  </Button>
                </div>
              ) : isLevel3Approved ? (
                <div className="p-4 bg-tertiary/10 border border-tertiary/30 rounded-DEFAULT space-y-2">
                  <div className="flex items-center gap-2 text-tertiary">
                    <Check className="w-5 h-5" />
                    <span className="font-bold text-sm">Level 3 Full Institutional Clearance</span>
                  </div>
                  <p className="text-[11px] text-outline">
                    Your utility bill or bank statement has been verified and cleared. You enjoy unlimited allocations and OTC desk routing.
                  </p>
                </div>
              ) : isLevel3Pending ? (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-DEFAULT space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="font-bold text-sm">Submitted — Pending Manual Approval by Admin Panel</span>
                  </div>
                  <p className="text-[11px] text-outline">
                    Your {submissions.level3?.docCategory === 'UTILITY_BILL' ? 'Utility Bill' : 'Bank Statement'} ({submissions.level3?.fileName}) has been securely submitted.
                    The admin panel is reviewing the address match and issue date (&lt;3 months old).
                  </p>
                  <div className="pt-2 text-[11px] text-outline border-t border-border-hairline space-y-1">
                    <div>Submitted: <span className="text-on-surface">{new Date(submissions.level3?.submittedAt || '').toLocaleString()}</span></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLevel3Submit} className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-sm font-serif font-bold text-on-surface block">
                      Level 3: Proof of Address &amp; Institutional Standing
                    </span>
                    <p className="text-[11px] text-outline">
                      Upload a Utility Bill (Electricity, Water, Gas, Internet) or Bank Statement issued strictly less than 3 months old from today's date.
                    </p>
                  </div>

                  <div className="p-2.5 bg-primary/10 border border-primary/30 text-primary text-[11px] rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span><strong>NOTE:</strong> Your document will be manually approved by the admin panel upon review.</span>
                  </div>

                  {l3Error && (
                    <div className="p-2.5 bg-error/10 border border-error/30 text-error text-[11px] rounded-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{l3Error}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] text-outline block">Document Type:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="l3-category"
                          value="UTILITY_BILL"
                          checked={l3Category === 'UTILITY_BILL'}
                          onChange={() => setL3Category('UTILITY_BILL')}
                          className="accent-primary"
                        />
                        <span>Utility Bill (Water, Electric, Gas)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="l3-category"
                          value="BANK_STATEMENT"
                          checked={l3Category === 'BANK_STATEMENT'}
                          onChange={() => setL3Category('BANK_STATEMENT')}
                          className="accent-primary"
                        />
                        <span>Bank Statement</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="kyc-provider" className="text-[11px] text-outline block">
                        Utility Provider or Bank Name:
                      </label>
                      <input
                        id="kyc-provider"
                        type="text"
                        value={l3Provider}
                        onChange={(e) => setL3Provider(e.target.value)}
                        placeholder="e.g. UBS Switzerland / Zurich Utilities"
                        className="w-full h-8 px-2.5 text-xs bg-surface-container border border-border-hairline rounded-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="kyc-billdate" className="text-[11px] text-outline block">
                        Document Issue Date (&lt;3 months old):
                      </label>
                      <input
                        id="kyc-billdate"
                        type="date"
                        value={l3BillDate}
                        onChange={(e) => setL3BillDate(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs bg-surface-container border border-border-hairline rounded-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="kyc-address" className="text-[11px] text-outline block">
                      Full Billing / Residential Address:
                    </label>
                    <input
                      id="kyc-address"
                      type="text"
                      value={l3Address}
                      onChange={(e) => setL3Address(e.target.value)}
                      placeholder="e.g. Bahnhofstrasse 45, 8001 Zurich, Switzerland"
                      className="w-full h-8 px-2.5 text-xs bg-surface-container border border-border-hairline rounded-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="kyc-utility-file" className="text-[11px] text-outline block">
                      Upload Document File (PDF, PNG, JPG):
                    </label>
                    <input
                      id="kyc-utility-file"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setL3File(e.target.files?.[0] || null)}
                      className="w-full text-xs text-outline file:mr-3 file:py-1 file:px-2.5 file:rounded-xs file:border file:border-border-hairline file:bg-surface-container file:text-xs file:font-mono file:text-on-surface hover:file:bg-surface-container-high"
                    />
                  </div>

                  <label className="flex items-start gap-2 pt-1 text-[11px] text-outline cursor-pointer">
                    <input
                      type="checkbox"
                      checked={l3Attested}
                      onChange={(e) => setL3Attested(e.target.checked)}
                      className="mt-0.5 rounded-xs accent-primary"
                    />
                    <span>
                      I certify that the address and utility provider / bank name are clearly visible and document is less than 3 months old from today's date.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={l3Submitting}
                    className="w-full font-mono text-xs uppercase tracking-wider"
                  >
                    {l3Submitting ? 'Submitting Document...' : 'Submit Document for Verification'}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Enclave Governance Attestation Credentials Checklist */}
          <div className="pt-3 border-t border-border-hairline space-y-2 font-mono text-[11px]">
            <span className="text-[10px] text-outline uppercase tracking-wider block">
              Verified Governance &amp; Regulatory Documents
            </span>
            <div className="divide-y divide-border-hairline border border-border-hairline rounded-DEFAULT bg-surface-container-low">
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-outline" />
                  <span className="font-sans text-on-surface">Grant Global Holdings AG Charter</span>
                </div>
                <span className="text-tertiary font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> VERIFIED
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-outline" />
                  <span className="font-sans text-on-surface">Source of Wealth Notarization (Zurich Treuhand)</span>
                </div>
                <span className="text-tertiary font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> ATTESTED
                </span>
              </div>
            </div>

            <div className="p-2 bg-surface-container-low rounded-DEFAULT border border-border-hairline flex items-center justify-between text-[10px]">
              <span className="text-outline">ORACLE ATTESTATION:</span>
              <span className="text-primary font-bold">CHAINLINK CCIP #99214-CH</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-border-hairline flex items-center justify-between text-[10px] font-mono text-outline">
          <span>NEXT AUDIT: 2027-12-31</span>
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-1 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-DEFAULT border border-border-hairline font-mono text-xs transition-colors cursor-pointer"
          >
            Close Passport
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
