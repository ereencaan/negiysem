export const colors = {
  primary: '#1a1a2e',
  primaryLight: '#16213e',
  secondary: '#e94560',
  secondaryLight: '#ff6b6b',
  accent: '#0f3460',
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#6c757d',
  textLight: '#adb5bd',
  border: '#dee2e6',
  borderLight: '#e9ecef',
  error: '#dc3545',
  errorLight: '#f8d7da',
  success: '#28a745',
  successLight: '#d4edda',
  warning: '#ffc107',
  white: '#ffffff',
  black: '#000000',
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
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
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
