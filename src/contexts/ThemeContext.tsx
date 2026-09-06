import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, darkColors, lightColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  isLoaded: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = '@bebematch_theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('dark'); // Por defecto dark
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (isMounted) {
          if (saved === 'light' || saved === 'dark' || saved === 'system') {
            setMode(saved);
          }
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('[ThemeContext] Error al leer el tema de AsyncStorage:', err);
        if (isMounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme !== 'light';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch((err) => {
      console.warn('[ThemeContext] Error al persistir el tema en AsyncStorage:', err);
    });
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const value = useMemo(
    () => ({
      mode,
      isDark,
      isLoaded,
      colors,
      spacing,
      typography,
      setThemeMode,
      toggleTheme,
    }),
    [mode, isDark, isLoaded, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
};
