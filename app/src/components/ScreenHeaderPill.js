import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { moderateVerticalScale } from '../utils/responsive';

// Caja de título con borde verde redondeado, usada como header de
// pantallas que no tienen un header sólido (Historial, y más adelante
// Escanear/Mis plantas "primera vez" -- se ve el mismo patrón en los 3
// mockups del flujo). Separado en su propio componente para no repetir
// estos mismos estilos 3 veces.
//
// El texto usa la misma fuente y tamaño que el saludo "Hola, {nombre}"
// del banner de Monitoreo (RozhaOne, moderateVerticalScale(28)) -- acá
// no hay foto de fondo detrás, así que en vez de blanco va en verde,
// sobre la caja con borde.
export default function ScreenHeaderPill({ title }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: 'RozhaOne_400Regular',
    fontSize: moderateVerticalScale(28),
    color: colors.primaryDark,
  },
});
