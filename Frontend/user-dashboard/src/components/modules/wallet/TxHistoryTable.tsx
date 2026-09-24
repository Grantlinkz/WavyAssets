import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  CheckCircle2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

interface TxHistoryTableProps {
  maskBalances?: boolean;
}

export const TxHistoryTable: React.FC<TxHistoryTableProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const { transactions, filterVertical, setFilterVertical } = useLiquidStore();
  const [downloaded, setDownloaded] = useState(false);

  const [sortField, setSortField] = useState<'timestamp' | 'amount'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filterOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Deposits / Wires', value: 'CASH' },
    { label: 'Trades / Swaps', value: 'CRYPTO' },
    { label: 'Dividends & Yield', value: 'STOCKS' },
    { label: 'Rental Cleared', value: 'REAL_ESTATE' },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterVertical === 'ALL') return true;
      return tx.vertical === filterVertical;
    });
  }, [transactions, filterVertical]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === 'amount') {
        return sortOrder === 'asc' ? a.amountUsd - b.amountUsd : b.amountUsd - a.amountUsd;
      }
      const cmp = a.timestamp.localeCompare(b.timestamp);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, safeCurrentPage, pageSize]);

  const handleSortToggle = (field: 'timestamp' | 'amount') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Vertical', 'Type', 'Description', 'Amount USD', 'Status', 'Reference'];
    const rows = sortedTransactions.map((tx) => [
      tx.id,
      `"${tx.timestamp}"`,
      tx.vertical,
      tx.type,
      `"${tx.description}"`,
      tx.amountUsd,
      tx.status,
      tx.reference,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    
    if (typeof window !== 'undefined' && window.document) {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WavyAssets_Ledger_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT">
      {/* Table Header Bar */}
      <div className="p-3 border-b border-border-hairline flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 bg-surface-container-low">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-bold">
            Unified Historical Activity Ledger
          </span>
          <span className="px-1.5 py-0.5 bg-surface-container text-outline text-[10px] font-mono rounded-DEFAULT">
            {filteredTransactions.length} RECORDS
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Transaction Type Pills */}
          <div className="flex items-center bg-surface-container-lowest border border-border-hairline p-0.5 rounded-DEFAULT">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setFilterVertical(opt.value);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 font-mono text-[11px] rounded-DEFAULT transition-colors cursor-pointer ${
                  filterVertical === opt.value
                    ? 'bg-surface-container text-primary font-semibold'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export Action */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2 py-1 bg-surface-container hover:bg-surface-container-high border border-border-hairline text-on-surface font-mono text-[11px] rounded-DEFAULT flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>{downloaded ? 'Exported' : 'CSV'}</span>
          </button>
        </div>
      </div>

      {/* High Density Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-hairline bg-surface-container-low/60 text-outline text-[11px] font-mono uppercase tracking-wider select-none">
              <th className="py-2.5 px-3">
                <button
                  type="button"
                  data-testid="tx-sort-date-btn"
                  onClick={() => handleSortToggle('timestamp')}
                  className="flex items-center gap-1 hover:text-on-surface cursor-pointer"
                >
                  <span>Date &amp; Time</span>
                  <ArrowUpDown className="w-3 h-3 text-primary" />
                  {sortField === 'timestamp' && (
                    <span className="text-primary text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3">Category / Vertical</th>
              <th className="py-2.5 px-3">Description &amp; Counterparty</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">
                <button
                  type="button"
                  data-testid="tx-sort-amount-btn"
                  onClick={() => handleSortToggle('amount')}
                  className="inline-flex items-center gap-1 hover:text-on-surface cursor-pointer ml-auto"
                >
                  <span>Settled Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-primary" />
                  {sortField === 'amount' && (
                    <span className="text-primary text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3 text-center">Audit Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline text-xs font-mono tabular-nums">
            {paginatedTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-surface-container/50 transition-colors"
              >
                <td className="py-2 px-3 text-outline text-[11px]">{tx.timestamp}</td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-DEFAULT text-[10px] uppercase font-semibold ${
                      tx.vertical === 'CRYPTO'
                        ? 'bg-primary/10 text-primary'
                        : tx.vertical === 'STOCKS'
                        ? 'bg-secondary/10 text-secondary'
                        : tx.vertical === 'REAL_ESTATE'
                        ? 'bg-tertiary/10 text-tertiary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {tx.type} • {tx.vertical}
                  </span>
                </td>
                <td className="py-2 px-3 text-on-surface font-sans text-xs">
                  {tx.description}
                </td>
                <td className="py-2 px-3">
                  <span className="text-tertiary font-medium flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{tx.status}</span>
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-semibold font-mono">
                  <span
                    className={
                      tx.type === 'DEPOSIT' || tx.type === 'DIVIDEND' || tx.type === 'SWEEP'
                        ? 'text-tertiary'
                        : 'text-on-surface'
                    }
                  >
                    {formatMaskedCurrency(tx.amountUsd, maskBalances)}
                  </span>
                </td>
                <td className="py-2 px-3 text-center text-outline text-[10px]">
                  {tx.reference}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 border-t border-border-hairline bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs text-outline">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-surface border border-border-hairline text-on-surface px-2 py-0.5 rounded text-xs cursor-pointer focus:outline-none focus:border-primary"
          >
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span data-testid="tx-page-counter" className="ml-2 text-on-surface-variant text-[11px]">
            Showing {sortedTransactions.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1} -{' '}
            {Math.min(safeCurrentPage * pageSize, sortedTransactions.length)} of {sortedTransactions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px]">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="tx-prev-btn"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-surface-container hover:bg-surface-container-high border border-border-hairline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              data-testid="tx-next-btn"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-surface-container hover:bg-surface-container-high border border-border-hairline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
