'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lys er standard for hele systemet. Kun et aktivt valg fra brukeren
    // (lagret i localStorage) kan gjøre siden mørk. Vi spør derfor ikke
    // operativsystemet — `prefers-color-scheme: dark` ville gjort nettstedet
    // mørkt for alle med mørkmodus på maskinen.
    const stored = localStorage.getItem('tonsberglivet-theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tonsberglivet-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback for prerendering / contexts without ThemeProvider
    return { theme: 'light' as const, toggleTheme: () => {} };
  }
  return context;
}
