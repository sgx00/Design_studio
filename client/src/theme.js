const theme = {
  colors: {
    primary: '#6C5CE7',
    primaryDark: '#5A4BD1',
    primaryLight: '#A29BFE',
    primaryGhost: 'rgba(108, 92, 231, 0.08)',
    secondary: '#00CEC9',
    secondaryDark: '#00B5B0',
    accent: '#FD79A8',
    accentDark: '#E84393',

    text: '#2D3436',
    textSecondary: '#636E72',
    textMuted: '#B2BEC3',

    background: '#F8F9FE',
    surface: '#FFFFFF',
    surfaceHover: '#F1F0FF',
    border: '#E8E6F0',
    borderLight: '#F0EFF5',

    success: '#00B894',
    warning: '#FDCB6E',
    error: '#FF7675',
    info: '#74B9FF',

    gradient: {
      primary: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
      hero: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
      card: 'linear-gradient(135deg, #6C5CE7 0%, #00CEC9 100%)',
      warm: 'linear-gradient(135deg, #FD79A8 0%, #FDCB6E 100%)',
      dark: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
    },
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    display: { size: '4rem', weight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' },
    h1: { size: '2.75rem', weight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' },
    h2: { size: '2rem', weight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
    h3: { size: '1.5rem', weight: 600, lineHeight: 1.3 },
    h4: { size: '1.125rem', weight: 600, lineHeight: 1.4 },
    body: { size: '1rem', weight: 400, lineHeight: 1.6 },
    bodyLarge: { size: '1.125rem', weight: 400, lineHeight: 1.7 },
    small: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
    caption: { size: '0.75rem', weight: 500, lineHeight: 1.4, letterSpacing: '0.04em' },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
  },

  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 30px rgba(0, 0, 0, 0.12)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.15)',
    glow: '0 0 40px rgba(108, 92, 231, 0.3)',
    cardHover: '0 12px 40px rgba(108, 92, 231, 0.15)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  layout: {
    maxWidth: '1280px',
    headerHeight: '72px',
  },
};

export default theme;
