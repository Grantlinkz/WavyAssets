import React from 'react';
import { Filter } from 'lucide-react';
import { useTerminalStore, type MegaMenuCategory } from '../../store/useTerminalStore';

interface CategoryTab {
  id: MegaMenuCategory;
  label: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'All Services' },
  { id: 'liquid-digital', label: 'Crypto & Digital' },
  { id: 'dma-equities', label: 'Stocks & Pre-IPO' },
  { id: 'physical-vaults', label: 'Real Estate & Vaults' },
];

export const CategoryFilter: React.FC = () => {
  const activeCategory = useTerminalStore((state) => state.megaMenuCategory);
  const setCategory = useTerminalStore((state) => state.setMegaMenuCategory);

  return (
    <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest px-4 py-2 rounded-sm border border-outline/30">
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto py-0.5">
        <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-[11px] uppercase tracking-wider shrink-0">
          <Filter className="w-3.5 h-3.5 text-outline" />
          <span>Category Selector:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-2.5 py-1 rounded-sm text-[11px] uppercase tracking-wider font-semibold transition-all ${
                  isSelected
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

     
    </div>
  );
};
