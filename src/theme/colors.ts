export interface ThemeColors {
  salmon: string;
  salmonLight: string;
  salmonDark: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  border2: string;
  text: string;
  text2: string;
  text3: string;
  glass: string;
  glass2: string;
}

export const darkColors: ThemeColors = {
  salmon: '#E8735A',
  salmonLight: 'rgba(232, 115, 90, 0.12)',
  salmonDark: '#C85A42',
  secondary: '#9B6FA1',
  success: '#4ADE80',
  warning: '#FCD34D',
  error: '#FF6B9D',
  bg: '#0A0A0A',
  surface: '#18181B',
  surface2: '#242429',
  surface3: '#2E2E35',
  border: 'rgba(255, 255, 255, 0.08)',
  border2: 'rgba(255, 255, 255, 0.14)',
  text: '#F5F5F5',
  text2: '#A0A0A0',
  text3: '#7E7E84',
  glass: 'rgba(255, 255, 255, 0.04)',
  glass2: 'rgba(255, 255, 255, 0.07)',
};

export const lightColors: ThemeColors = {
  salmon: '#C35338',
  salmonLight: 'rgba(195, 83, 56, 0.12)',
  salmonDark: '#A9442C',
  secondary: '#9B6FA1',
  success: '#2E9E5B',
  warning: '#E5A50A',
  error: '#E53E3E',
  bg: '#FDF8F4',
  surface: '#FFFFFF',
  surface2: '#F5EDE6',
  surface3: '#EDE0D8',
  border: 'rgba(44, 31, 26, 0.12)',
  border2: 'rgba(44, 31, 26, 0.20)',
  text: '#2C1F1A',
  text2: '#7A6058',
  text3: '#86685E',
  glass: 'rgba(44, 31, 26, 0.03)',
  glass2: 'rgba(44, 31, 26, 0.05)',
};

// Tema oscuro por defecto (identidad principal de BebéMatch)
export const colors: ThemeColors = darkColors;
