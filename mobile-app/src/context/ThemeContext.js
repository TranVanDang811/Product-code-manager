import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const THEME_STORAGE_KEY = 'pcm_theme_preference';

export const lightColors = {
  isDark: false,
  bgPrimary: '#f8fafc',
  bgSecondary: '#ffffff',
  bgCard: '#ffffff',
  bgTertiary: '#f1f5f9',
  bgElevated: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderAccent: '#93c5fd',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#2563eb',
  textOnPrimary: '#ffffff',
  primaryHover: '#1d4ed8',
  primaryLight: '#eff6ff',
  primaryBorder: '#bfdbfe',
  accent: '#0284c7',
  accentLight: '#e0f2fe',
  accentGlow: 'rgba(2, 132, 199, 0.15)',
  success: '#059669',
  successLight: '#ecfdf5',
  successBorder: '#a7f3d0',
  warning: '#d97706',
  warningLight: '#fffbeb',
  warningBorder: '#fde68a',
  danger: '#e11d48',
  dangerLight: '#fff1f2',
  dangerBorder: '#fecdd3',
  tabBarBg: '#ffffff',
  tabBarBorder: '#e2e8f0',
  tabBarActive: '#2563eb',
  tabBarInactive: '#94a3b8',
  headerBg: '#ffffff',
  headerBorder: '#e2e8f0',
  glassOverlay: 'rgba(15, 23, 42, 0.65)',
  glassCard: 'rgba(255, 255, 255, 0.92)',
  laserGlow: '#06b6d4',
  viewfinderBorder: '#2563eb',
};

export const darkColors = {
  isDark: true,
  bgPrimary: '#09090b',       // True Matte Black (Zinc 950)
  bgSecondary: '#121214',     // Dark Charcoal
  bgCard: '#18181b',          // Zinc 900 surface
  bgTertiary: '#27272a',      // Zinc 800 input surface
  bgElevated: '#18181b',      // Modal / dropdown
  border: '#2e2e33',          // Border
  borderLight: '#27272a',
  borderAccent: '#52525b',
  textPrimary: '#fafafa',     // Crisp white
  textSecondary: '#a1a1aa',   // Muted silver
  textMuted: '#71717a',       // Deep silver
  primary: '#fafafa',         // Stealth Monochrome Off-White
  textOnPrimary: '#000000',   // Pure Black on Primary Button
  primaryHover: '#e4e4e7',
  primaryLight: 'rgba(255, 255, 255, 0.1)',
  primaryBorder: 'rgba(255, 255, 255, 0.25)',
  accent: '#a1a1aa',          // Cool Platinum
  accentLight: 'rgba(161, 161, 170, 0.18)',
  accentGlow: 'rgba(255, 255, 255, 0.25)',
  success: '#10b981',         // Neon Emerald
  successLight: 'rgba(16, 185, 129, 0.18)',
  successBorder: 'rgba(16, 185, 129, 0.4)',
  warning: '#f59e0b',         // Neon Amber
  warningLight: 'rgba(245, 158, 11, 0.18)',
  warningBorder: 'rgba(245, 158, 11, 0.4)',
  danger: '#f43f5e',          // Neon Rose
  dangerLight: 'rgba(244, 63, 94, 0.18)',
  dangerBorder: 'rgba(244, 63, 94, 0.4)',
  tabBarBg: '#121214',
  tabBarBorder: '#27272a',
  tabBarActive: '#fafafa',
  tabBarInactive: '#71717a',
  headerBg: '#121214',
  headerBorder: '#27272a',
  glassOverlay: 'rgba(0, 0, 0, 0.85)',
  glassCard: 'rgba(24, 24, 27, 0.95)',
  laserGlow: '#ffffff',
  viewfinderBorder: '#a1a1aa',
};

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setThemeState(saved);
        }
      } catch (err) {
        console.warn('Failed to load theme preference', err);
      }
    }
    loadTheme();
  }, []);

  const setTheme = async (newTheme) => {
    try {
      setThemeState(newTheme);
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('Failed to save theme preference', err);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

