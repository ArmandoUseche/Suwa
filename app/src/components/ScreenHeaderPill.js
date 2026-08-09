import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Caja de título con borde verde redondeado, usada como header de
// pantallas que no tienen un header sólido (Historial, y más adelante
// Escanear/Mis plantas "primera vez" -- se ve el mismo patrón en los 3
// mockups del flujo). Separado en su propio componente para no repetir
// estos mismos estilos 3 veces.
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: moderateScale(20),
    color: colors.primary,
  },
});
