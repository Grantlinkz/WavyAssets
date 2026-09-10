import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const resolvedTheme = useTerminalStore((state) => state.resolvedTheme);
  const toggleTheme = useTerminalStore((state) => state.toggleTheme);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center h-8 w-8 rounded-md bg-surface-container border border-outline hover:border-primary/60 text-on-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${className}`}
      aria-label={`Switch to ${isDark ? 'Luxury Light' : 'Obsidian Dark'} mode`}
      title={`Toggle theme (${isDark ? 'Obsidian Dark' : 'Luxury Light'})`}
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <Sun className="h-4 w-4 text-primary transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
