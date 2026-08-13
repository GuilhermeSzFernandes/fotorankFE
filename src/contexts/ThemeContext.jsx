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
  '--danger':         '248 113 113',
  '--danger-bg':      '24 13 13',
  '--danger-border':  '62 24 24',
  '--success':        '74 222 128',
  '--success-bg':     '13 26 18',
  '--success-border': '20 66 40',
  '--warning':        '251 191 36',
  '--warning-bg':     '28 22 10',
  '--warning-border':  '74 51 12',
  '--info':           '96 165 250',
  '--info-bg':        '13 20 32',
  '--info-border':    '30 48 74',
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
  '--danger':         '185 28 28',
  '--danger-bg':      '254 242 242',
  '--danger-border':  '252 165 165',
  '--success':        '21 128 61',
  '--success-bg':     '240 253 244',
  '--success-border': '134 239 172',
  '--warning':        '161 98 7',
  '--warning-bg':     '255 251 235',
  '--warning-border':  '253 224 71',
  '--info':           '29 78 216',
  '--info-bg':        '239 246 255',
  '--info-border':    '147 197 253',
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
    () => localStorage.getItem('fotorank_theme') || 'light'
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
