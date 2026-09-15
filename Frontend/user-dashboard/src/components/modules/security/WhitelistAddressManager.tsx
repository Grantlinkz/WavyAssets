import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Clock,
  Lock,
} from 'lucide-react';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

export const WhitelistAddressManager: React.FC = () => {
  const {
    destinations,
    isAddDestinationModalOpen,
    openAddDestinationModal,
    closeAddDestinationModal,
    addWhitelistedDestination,
    cancelDestination,
  } = useGovernanceStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [transferTriggeredId, setTransferTriggeredId] = useState<string | null>(null);

  // Add Destination Form State
  const [assetRail, setAssetRail] = useState('Bitcoin');
  const [railBadge, setRailBadge] = useState('BTC');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [beneficiaryOrg, setBeneficiaryOrg] = useState('');
  const [addressOrIban, setAddressOrIban] = useState('');

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInitiateTransfer = (id: string) => {
    setTransferTriggeredId(id);
    setTimeout(() => setTransferTriggeredId(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationLabel.trim() || !addressOrIban.trim()) return;

    addWhitelistedDestination({
      assetRail,
      assetName: `${assetRail} Protocol Rail`,
      railBadge,
      destinationLabel: destinationLabel.trim(),
      beneficiaryOrg: beneficiaryOrg.trim() || 'Verified Fiduciary Desk',
      addressOrIban: addressOrIban.trim(),
    });

    setDestinationLabel('');
    setBeneficiaryOrg('');
    setAddressOrIban('');
  };

  const handleRailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setAssetRail(val);
    setRailBadge(
      val === 'Bitcoin'
        ? 'BTC'
        : val === 'Ethereum'
        ? 'ETH'
        : val === 'Solana'
        ? 'SOL'
        : val.includes('CHF')
        ? 'CHF'
        : 'USD'
    );
  };

  return (
    <div
      data-testid="whitelist-address-manager-panel"
      className="bg-surface-container-low border border-border-hairline rounded-DEFAULT p-5 space-y-4 shadow-md"
    >
      {/* Header with Title & Add Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-sm font-semibold text-on-surface">
              Mandatory Withdrawal Address Whitelist & Time-Lock Matrix
            </h2>
            <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] rounded-DEFAULT font-bold">
              ● 24-48 HOUR REVERSAL WINDOW ENFORCED
            </span>
          </div>
          <p className="font-sans text-[11px] text-outline mt-0.5">
            Cold quarantine enforcement prevents unauthorized exfiltration of sovereign liquidities
          </p>
        </div>

        <button
          type="button"
          data-testid="add-destination-btn"
          onClick={openAddDestinationModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-surface hover:bg-primary-hover font-mono text-xs font-bold uppercase rounded-DEFAULT transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Destination</span>
        </button>
      </div>

      {/* Sovereign Fiduciary Notice Callout */}
      <div className="p-3.5 bg-surface-container rounded-DEFAULT border border-border-hairline flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="font-sans text-xs text-on-surface-variant space-y-1">
          <span className="text-primary font-mono text-[10px] font-bold uppercase tracking-wider block">
            SOVEREIGN FIDUCIARY CUSTODY POLICY (AMLA ART. 9 & FINMA CIRCULAR 2018/3)
          </span>
          <p className="leading-relaxed">
            Instantaneous withdrawal to newly entered external addresses or bank IBANs is strictly prohibited. Every newly registered destination undergoes a mandatory <strong>48-Hour Cryptographic Time-Lock Quarantine</strong>. Transfers to quarantined destinations remain cryptographically locked until the quarantine countdown matures.
          </p>
        </div>
      </div>

      {transferTriggeredId && (
        <div className="p-2.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-xs rounded-DEFAULT">
          Transfer initiated to verified whitelisted destination. Routing through 2-of-3 HSM Gateway.
        </div>
      )}

      {/* Destination Whitelist Table */}
      <div className="overflow-x-auto border border-border-hairline rounded-DEFAULT">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="bg-surface-container text-outline text-[10px] uppercase tracking-wider border-b border-border-hairline">
              <th className="py-2.5 px-3.5">Asset / Rail</th>
              <th className="py-2.5 px-3.5">Destination & Beneficiary</th>
              <th className="py-2.5 px-3.5">Recipient Address / Routing</th>
              <th className="py-2.5 px-3.5">Time-Lock Status</th>
              <th className="py-2.5 px-3.5">Signers</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline bg-surface-container-lowest">
            {destinations.map((dest) => (
              <tr
                key={dest.id}
                data-testid={`whitelist-row-${dest.id}`}
                className={`transition-colors ${
                  dest.isTimeLocked
                    ? 'bg-surface-container/40 hover:bg-surface-container/70'
                    : 'hover:bg-surface-container-low'
                }`}
              >
                {/* Asset / Rail */}
                <td className="py-3 px-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-DEFAULT bg-surface-container border border-border-hairline flex items-center justify-center font-bold text-[10px] text-primary">
                      {dest.railBadge}
                    </span>
                    <div>
                      <div className="font-bold text-on-surface">{dest.assetRail}</div>
                      <div className="text-[10px] text-outline">{dest.assetName}</div>
                    </div>
                  </div>
                </td>

                {/* Destination & Beneficiary */}
                <td className="py-3 px-3.5">
                  <div className="font-sans font-semibold text-on-surface">
                    {dest.destinationLabel}
                  </div>
                  <div className="text-[10px] text-outline font-sans">{dest.beneficiaryOrg}</div>
                </td>

                {/* Recipient Address / Routing */}
                <td className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-DEFAULT w-fit border border-border-hairline">
                    <span className="text-[11px] text-on-surface-variant font-mono tabular-nums">
                      {dest.addressOrIban}
                    </span>
                    <button
                      type="button"
                      title="Copy Address"
                      onClick={() => handleCopy(dest.id, dest.addressOrIban)}
                      className="text-outline hover:text-on-surface cursor-pointer"
                    >
                      {copiedId === dest.id ? (
                        <Check className="w-3 h-3 text-tertiary" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Time-Lock Status & Countdown */}
                <td className="py-3 px-3.5 min-w-[200px]">
                  {dest.isTimeLocked ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.2 bg-secondary/20 text-secondary text-[10px] font-bold rounded-DEFAULT flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" />
                          TIME-LOCKED (QUARANTINE)
                        </span>
                      </div>
                      <div className="text-secondary font-bold text-xs tracking-wide">
                        {dest.remainingDisplay}
                      </div>
                      <div className="w-full h-1 bg-surface-container rounded-DEFAULT overflow-hidden">
                        <div
                          className="h-full bg-secondary transition-all"
                          style={{
                            width: `${Math.round(
                              ((dest.quarantineHoursTotal - dest.quarantineHoursRemaining) /
                                dest.quarantineHoursTotal) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 bg-tertiary/15 text-tertiary text-[10px] font-bold rounded-DEFAULT">
                      ● MATURED & ACTIVE
                    </span>
                  )}
                </td>

                {/* Signers Confirmed */}
                <td className="py-3 px-3.5 text-[10px]">
                  <div className="text-on-surface font-semibold">{dest.signersSummary}</div>
                  <div className="text-outline">{dest.signersDetails}</div>
                </td>

                {/* Actions */}
                <td className="py-3 px-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {dest.isTimeLocked ? (
                      <button
                        type="button"
                        data-testid={`cancel-destination-btn-${dest.id}`}
                        onClick={() => cancelDestination(dest.id)}
                        className="px-2.5 py-1 bg-error/15 hover:bg-error text-error hover:text-surface text-[10px] font-bold uppercase rounded-DEFAULT transition-colors cursor-pointer"
                      >
                        Cancel & Blacklist
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          data-testid={`initiate-transfer-btn-${dest.id}`}
                          onClick={() => handleInitiateTransfer(dest.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-DEFAULT transition-colors cursor-pointer shadow-sm ${
                            transferTriggeredId === dest.id
                              ? 'bg-secondary text-surface'
                              : 'bg-primary text-surface hover:bg-primary-hover'
                          }`}
                        >
                          {transferTriggeredId === dest.id
                            ? 'Dispatched (Simulated)'
                            : 'Initiate Transfer (Simulated)'}
                        </button>
                        <button
                          type="button"
                          title="De-list Destination"
                          onClick={() => cancelDestination(dest.id)}
                          className="p-1 text-outline hover:text-error cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Destination Modal */}
      {isAddDestinationModalOpen && (
        <div
          data-testid="add-destination-modal"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-surface-container-low border border-border-hairline rounded-DEFAULT max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <h3 className="font-serif text-sm font-semibold uppercase text-on-surface">
                  Register Whitelisted Destination
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAddDestinationModal}
                className="text-outline hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-outline uppercase block mb-1">
                  Settlement Rail / Asset
                </label>
                <select
                  value={assetRail}
                  onChange={handleRailChange}
                  className="w-full bg-surface-container border border-border-hairline rounded-DEFAULT p-2 text-on-surface focus:border-primary focus:outline-none"
                >
                  <option value="Bitcoin">Bitcoin (BTC Native Taproot)</option>
                  <option value="Ethereum">Ethereum (ERC-20 / USDC)</option>
                  <option value="Solana">Solana (SOL Custody)</option>
                  <option value="USD Wire">Fedwire / JPMorgan Private Bank</option>
                  <option value="CHF Wire">Swiss SIC / Pictet & Cie</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-outline uppercase block mb-1">
                  Destination Description / Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zurich Family Office Operating Safe"
                  value={destinationLabel}
                  onChange={(e) => setDestinationLabel(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-2 text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-outline uppercase block mb-1">
                  Beneficiary Institution / Custodian
                </label>
                <input
                  type="text"
                  placeholder="e.g. Treuhand Zurich Custody Desk"
                  value={beneficiaryOrg}
                  onChange={(e) => setBeneficiaryOrg(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-2 text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-outline uppercase block mb-1">
                  Recipient Address or IBAN
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x... or bc1p... or CH93..."
                  value={addressOrIban}
                  onChange={(e) => setAddressOrIban(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-2 text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-secondary/10 border border-secondary/30 rounded-DEFAULT text-[11px] font-sans text-secondary leading-relaxed">
                <strong>Mandatory 48-Hour Lock:</strong> Once registered, this destination will immediately enter a 48-hour quarantine window during which transfers cannot be initiated.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAddDestinationModal}
                  className="px-3 py-1.5 bg-surface-container text-outline rounded-DEFAULT hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-destination-btn"
                  className="px-3 py-1.5 bg-primary text-surface font-bold uppercase rounded-DEFAULT hover:bg-primary-hover"
                >
                  Register (48H Lock)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
