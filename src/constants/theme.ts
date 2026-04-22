export const colors = {
  primary: '#c2185b',
  primaryLight: '#e91e7a',
  primarySoft: '#fce4ec',
  secondary: '#880e4f',
  secondaryLight: '#ad1457',
  accent: '#f8bbd0',
  background: '#fafafa',
  surface: '#f5f5f5',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#e8e8e8',
  borderLight: '#f0f0f0',
  error: '#d32f2f',
  errorLight: '#ffcdd2',
  success: '#2e7d32',
  successSoft: '#e8f5e9',
  successLight: '#c8e6c9',
  warning: '#f9a825',
  white: '#ffffff',
  black: '#000000',
  gold: '#d4a574',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
