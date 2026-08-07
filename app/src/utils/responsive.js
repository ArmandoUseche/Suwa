// Utilidades de escalado responsivo. El diseño en Figma se hizo pensando
// en un teléfono de referencia (iPhone 11 / 375x812 aprox). Estas funciones
// reescalan tamaños proporcionalmente al dispositivo real, para que la app
// no se vea "chiquita" en pantallas grandes ni "gigante" en pantallas
// pequeñas, y para que los tablets no hereden tamaños pensados para celular.
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Medidas del diseño de referencia (Figma).
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Un tablet mide considerablemente más de ancho que un celular grande.
// Con este umbral evitamos que un teléfono en modo horizontal se trate
// como tablet por error.
export const isTablet = SCREEN_WIDTH >= 768;

// Ancho máximo que puede ocupar el contenido "central" (formularios,
// tarjetas) en pantallas grandes, para que no se estire de borde a borde
// y se vea bien en un tablet o en web.
export const contentMaxWidth = 480;

// Escala horizontal pura: útil para anchos/alturas que deben seguir el
// ancho real de pantalla (ej. el ancho de un slide del onboarding).
export function scale(size) {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

export function verticalScale(size) {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
}

// Escala "moderada": la mayoría de las veces esta es la que se debe usar
// (fuentes, spacing, iconos). El factor amortigua el escalado para que en
// pantallas muy grandes (tablets) no todo crezca de forma exagerada.
export function moderateScale(size, factor = 0.5) {
  return size + (scale(size) - size) * factor;
}

export function moderateVerticalScale(size, factor = 0.5) {
  return size + (verticalScale(size) - size) * factor;
}

// Redondea a pixeles reales del dispositivo, evita bordes/textos borrosos
// en tamaños calculados dinámicamente.
export function pixelPerfect(size) {
  return PixelRatio.roundToNearestPixel(size);
}

export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};
