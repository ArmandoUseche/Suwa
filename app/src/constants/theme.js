// Paleta y estilos base de SUWA, tomados de los mockups de Figma.
// Centralizamos esto acá para no repetir valores hardcodeados en cada pantalla
// y para poder ajustar el look completo de la app desde un solo lugar.
//
// spacing y typography pasan por moderateScale: los valores de abajo son
// los del diseño de referencia (celular), pero el resultado ya viene
// ajustado al tamaño real del dispositivo (celular chico, celular grande
// o tablet), sin tener que tocar cada pantalla una por una.
import { moderateScale } from '../utils/responsive';

export const colors = {
  // Verde principal: botones, iconos activos, textos destacados
  primary: '#129C52',
  primaryDark: '#0E7A40',
  primaryLight: '#4CAF7D',

  // Fondos degradados (splash, login, registro, monitoreo)
  gradientStart: '#EAF7EC',
  gradientEnd: '#A9DBAB',

  // Blob orgánico del Onboarding (fondo blanco + mancha mint arriba,
  // color sacado directo del mockup de Figma).
  blobLight: '#E2F3E9',

  // Degradado de 3 tonos de la pantalla de Bienvenida (colores sacados
  // del mockup: claro arriba, medio en el cuerpo, un poco más claro de
  // nuevo hacia abajo).
  welcomeGradientTop: '#E7F5E9',
  welcomeGradientMid: '#A8D6AC',
  welcomeGradientBottom: '#C7E4C9',

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
    fontSize: moderateScale(30),
    fontWeight: '700',
    color: colors.primaryDark,
  },
  h2: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.textDark,
  },
  body: {
    fontSize: moderateScale(16),
    fontWeight: '400',
    color: colors.textDark,
  },
  caption: {
    fontSize: moderateScale(13),
    fontWeight: '400',
    color: colors.textMuted,
  },
  button: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
};

// El spacing usa un factor de escalado más bajo (0.3) a propósito: si
// escalara igual que las fuentes, en tablets los márgenes quedarían
// enormes y el contenido se vería perdido en el centro de la pantalla.
export const spacing = {
  xs: moderateScale(4, 0.3),
  sm: moderateScale(8, 0.3),
  md: moderateScale(16, 0.3),
  lg: moderateScale(24, 0.3),
  xl: moderateScale(32, 0.3),
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};
