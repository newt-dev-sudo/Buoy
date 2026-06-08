export const tokens = {
  surfaces: {
    base: '#0A0C0F',
    raised: '#111318',
    overlay: '#1A1F27',
    hover: '#1E2430',
    active: '#252D3A',
    card: '#13161C',
  },
  borders: {
    subtle: 'rgba(255,255,255,0.05)',
    default: 'rgba(255,255,255,0.08)',
    strong: 'rgba(255,255,255,0.12)',
  },
  text: {
    primary: '#E8ECF1',
    secondary: '#9BA3AF',
    muted: '#5C6570',
  },
  accent: {
    DEFAULT: '#4F8EF7',
    hover: '#6BA3FF',
    subtle: 'rgba(79,142,247,0.12)',
    fg: '#FFFFFF',
  },
  status: {
    running: '#34D399',
    stopped: '#6B7280',
    crashed: '#F87171',
    starting: '#FBBF24',
    stopping: '#FBBF24',
  },
  layout: {
    sidebarWidth: 64,
    titlebarHeight: 32,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
  },
} as const;
