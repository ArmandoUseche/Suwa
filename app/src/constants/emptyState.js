import { colors, spacing, typography } from './theme';
import { moderateScale, moderateVerticalScale } from '../utils/responsive';

// Single source of truth para las pantallas de "estado vacío" (Monitoreo
// sin dispositivo, Historial sin datos, y las que falten: Escanear/Mis
// plantas "primera vez"). Todas comparten el mismo esqueleto visual --
// header (banner con foto o pill con borde, según la pantalla) + imagen
// central + título + descripción + botón -- y hasta ahora cada pantalla
// tenía sus propios números "parecidos pero no iguales". Import de un
// solo lugar así quedan pixel-a-pixel idénticos, y una pantalla nueva
// solo tiene que importar de acá en vez de adivinar valores de nuevo.

// Alto del header (el banner con foto de Monitoreo y la pill de
// Historial usan este mismo alto, aunque su contenido interno sea
// distinto).
export const EMPTY_STATE_HEADER_HEIGHT = moderateVerticalScale(110);

// Tamaño (ancho y alto) de la imagen central -- foto de planta en
// Monitoreo, ilustración en Historial.
export const EMPTY_STATE_IMAGE_SIZE = moderateScale(200);

// Espacio entre el header y la imagen central.
export const EMPTY_STATE_GAP_AFTER_HEADER = spacing.xl * 3;

// Espacio entre la imagen central y el título.
export const EMPTY_STATE_GAP_AFTER_IMAGE = spacing.xl + moderateScale(30, 0.3);

export const emptyStateStyles = {
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  button: {
    marginHorizontal: spacing.lg,
  },
};
