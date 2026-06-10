import { createContext, useContext, useState, useEffect } from 'react';

const DARK = {
  '--base':           '8 8 8',
  '--surface':        '17 17 17',
  '--surface-raised': '22 22 22',
  '--surface-high':   '30 30 30',
  '--border':         '30 30 30',
  '--border-muted':   '20 20 20',
  '--border-strong':  '50 50 50',
  '--ink':            '232 232 232',
  '--ink-secondary':  '120 120 120',
  '--ink-muted':      '72 72 72',
  '--ink-ghost':      '40 40 40',
};

const LIGHT = {
  '--base':           '247 247 245',
  '--surface':        '255 255 255',
  '--surface-raised': '243 243 241',
  '--surface-high':   '232 232 229',
  '--border':         '229 229 226',
  '--border-muted':   '241 241 238',
  '--border-strong':  '200 200 197',
  '--ink':            '26 26 26',
  '--ink-secondary':  '107 107 104',
  '--ink-muted':      '155 155 152',
  '--ink-ghost':      '203 203 200',
};

function applyTheme(theme) {
  const vars = theme === 'light' ? LIGHT : DARK;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', theme);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('fotorank_theme') || 'dark'
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('fotorank_theme', theme);
  }, [theme]);

  function setTheme(mode) {
    setThemeState(mode);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
