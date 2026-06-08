export const tokens = {
  surfaces: {
    base: '#0D0F12',
    raised: '#111318',
    overlay: '#1A1F27',
    hover: '#252B36',
    active: '#2E3647',
  },
  borders: {
    subtle: '#1A1F27',
    default: '#252B36',
    strong: '#374151',
  },
  text: {
    primary: '#F1F5F9',
    secondary: '#8B96A8',
    muted: '#4B5563',
  },
  accent: {
    DEFAULT: '#4F8EF7',
    hover: '#6BA3FF',
    subtle: '#1A2744',
    fg: '#FFFFFF',
  },
  status: {
    running: '#22C55E',
    stopped: '#6B7280',
    crashed: '#EF4444',
    starting: '#F59E0B',
    stopping: '#F59E0B',
  },
  layout: {
    sidebarWidth: 220,
    titlebarHeight: 32,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 10,
  },
} as const;
