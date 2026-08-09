import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Chip chico de una lectura: ícono, valor con unidad, y una etiqueta de
// estado (ej. "Óptimo"). Usado en la fila de 3 chips del dashboard
// conectado de Monitoreo (mockup: gota 25% Óptimo / termómetro 22°C
// Ideal / sol 55% Muy buena).
export default function StatChip({ icon, value, unit, status }) {
  return (
    <View style={styles.chip}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Antes el fondo del chip era el mismo blanco que el fondo de la
  // pantalla, así que no se veía ningún "cuadrito" -- solo el ícono y
  // el texto flotando sueltos. El borde + sombra chica es lo que arma
  // el efecto "un poco 3D" del mockup (una tarjeta que se despega un
  // poco del fondo, no plana).
  chip: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: moderateScale(24),
    height: moderateScale(24),
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  value: {
    ...typography.h2,
    fontSize: moderateScale(18),
  },
  unit: {
    ...typography.caption,
    marginBottom: 2,
  },
  status: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
