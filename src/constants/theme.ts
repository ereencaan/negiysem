export const colors = {
  // Pudra pembe palette
  primary: '#c2185b',          // Koyu pudra/rose - ana butonlar
  primaryLight: '#e91e7a',     // Açık rose
  primarySoft: '#fce4ec',      // Çok açık pudra bg
  secondary: '#880e4f',        // Bordo-rose - accent
  secondaryLight: '#ad1457',   // Lighter bordo
  accent: '#f8bbd0',           // Pudra pembe accent
  background: '#fff8f9',       // Sıcak beyaz (hafif pembe tint)
  surface: '#fef0f3',          // Açık pudra yüzey
  card: '#ffffff',             // Beyaz kart
  text: '#3e2723',             // Koyu kahve - okunabilir
  textSecondary: '#8d6e63',    // Kahve-gri
  textLight: '#bcaaa4',        // Açık kahve
  border: '#f3e5e8',           // Pudra border
  borderLight: '#fce4ec',      // Çok açık border
  error: '#d32f2f',
  errorLight: '#ffcdd2',
  success: '#2e7d32',
  successLight: '#c8e6c9',
  warning: '#f9a825',
  white: '#ffffff',
  black: '#000000',
  gold: '#d4a574',             // Altın/bej - lüks detaylar
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
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
