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
  borderAccent: '#c7d2fe',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryLight: '#eef2ff',
  primaryBorder: '#c7d2fe',
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
  tabBarActive: '#4f46e5',
  tabBarInactive: '#94a3b8',
  headerBg: '#ffffff',
  headerBorder: '#e2e8f0',
  glassOverlay: 'rgba(15, 23, 42, 0.65)',
  glassCard: 'rgba(255, 255, 255, 0.92)',
  laserGlow: '#06b6d4',
  viewfinderBorder: '#4f46e5',
};

export const darkColors = {
  isDark: true,
  bgPrimary: '#0a0e1a',       // Deep obsidian
  bgSecondary: '#111827',     // Elevated card
  bgCard: '#131d31',          // Card surface
  bgTertiary: '#1e293b',      // Input & inner surface
  bgElevated: '#1a233a',      // Modal / dropdown
  border: '#1f293d',          // Border
  borderLight: '#192237',
  borderAccent: '#6366f1',
  textPrimary: '#f8fafc',     // Crisp white
  textSecondary: '#94a3b8',   // Muted silver
  textMuted: '#64748b',       // Deep silver
  primary: '#6366f1',         // Electric Indigo
  primaryHover: '#818cf8',
  primaryLight: 'rgba(99, 102, 241, 0.18)',
  primaryBorder: 'rgba(99, 102, 241, 0.45)',
  accent: '#06b6d4',          // Cyber Cyan
  accentLight: 'rgba(6, 182, 212, 0.18)',
  accentGlow: 'rgba(6, 182, 212, 0.35)',
  success: '#10b981',         // Neon Emerald
  successLight: 'rgba(16, 185, 129, 0.18)',
  successBorder: 'rgba(16, 185, 129, 0.4)',
  warning: '#f59e0b',         // Neon Amber
  warningLight: 'rgba(245, 158, 11, 0.18)',
  warningBorder: 'rgba(245, 158, 11, 0.4)',
  danger: '#f43f5e',          // Neon Rose
  dangerLight: 'rgba(244, 63, 94, 0.18)',
  dangerBorder: 'rgba(244, 63, 94, 0.4)',
  tabBarBg: '#0d1322',
  tabBarBorder: '#1c263d',
  tabBarActive: '#818cf8',
  tabBarInactive: '#64748b',
  headerBg: '#0d1322',
  headerBorder: '#1c263d',
  glassOverlay: 'rgba(0, 0, 0, 0.85)',
  glassCard: 'rgba(19, 29, 49, 0.95)',
  laserGlow: '#00f0ff',
  viewfinderBorder: '#818cf8',
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

