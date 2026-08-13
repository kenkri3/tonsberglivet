'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-full
                 bg-surface-muted hover:bg-border transition-all duration-300
                 focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={theme === 'light' ? 'Bytt til mørk modus' : 'Bytt til lys modus'}
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === 'light'
            ? 'rotate-0 scale-100 text-accent'
            : 'rotate-90 scale-0 text-accent'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          theme === 'dark'
            ? 'rotate-0 scale-100 text-accent'
            : '-rotate-90 scale-0 text-accent'
        }`}
      />
    </button>
  );
}
