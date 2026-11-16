import { createContext, useContext, useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'pcm_theme_preference';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Always enforce 'dark' mode to match Mobile App & UI-UX-Pro-Max
  const [theme] = useState('dark');

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      localStorage.removeItem('pcm_web_theme');
    } catch {
      // ignore
    }
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    document.body.style.backgroundColor = '#09090b';
    document.body.style.color = '#f4f4f5';
  }, []);

  const toggleTheme = () => {
    // Pure dark mode application - ensure dark class is active
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'dark', isDark: true, toggleTheme, setTheme: () => {} }}>
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
