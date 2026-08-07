// Paleta y estilos base de SUWA, tomados de los mockups de Figma.
// Centralizamos esto acá para no repetir valores hardcodeados en cada pantalla
// y para poder ajustar el look completo de la app desde un solo lugar.

export const colors = {
  // Verde principal: botones, iconos activos, textos destacados
  primary: '#129C52',
  primaryDark: '#0E7A40',
  primaryLight: '#4CAF7D',

  // Fondos degradados (splash, onboarding, bienvenida)
  gradientStart: '#EAF7EC',
  gradientEnd: '#A9DBAB',

  // Header sólido (Escanear, Historial, Configuración)
  headerGreen: '#1B7A43',

  // Texto
  textDark: '#1B3B24',
  textMuted: '#6B8072',
  textOnPrimary: '#FFFFFF',

  // Superficies
  background: '#FFFFFF',
  surface: '#F5FAF6',
  border: '#DCEBDE',

  // Estados / alertas
  warning: '#E0A526',
  danger: '#D9534F',
  success: '#129C52',
};

export const typography = {
  // Títulos grandes tipo "Bienvenido a SUWA"
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textDark,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textMuted,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};
