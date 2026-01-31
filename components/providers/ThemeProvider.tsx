'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ColorMode = 'dark' | 'light';

interface ThemeContextValue {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme-preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>('dark');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    if (stored === 'dark' || stored === 'light') {
      setColorModeState(stored);
    }
    setMounted(true);
  }, []);

  // Apply theme to document and persist to localStorage
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', colorMode === 'dark');
    localStorage.setItem(STORAGE_KEY, colorMode);
  }, [colorMode, mounted]);

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
