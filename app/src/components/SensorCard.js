import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Tarjeta de una sola lectura de sensor (humedad del suelo, temperatura,
// humedad ambiente). Es puramente presentacional: recibe el valor ya
// formateado y no sabe nada de la API ni del socket, así se puede usar
// tanto con datos mock (ahora) como con datos reales (cuando se conecte
// el Paso 5 al backend).
export default function SensorCard({ icon, label, value, unit, accentColor = colors.primary }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}1A` }]}>
        <Image source={icon} style={[styles.icon, { tintColor: accentColor }]} resizeMode="contain" />
      </View>

      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  iconWrapper: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    width: moderateScale(22),
    height: moderateScale(22),
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  value: {
    ...typography.h2,
    fontSize: moderateScale(24),
  },
  unit: {
    ...typography.caption,
    marginBottom: 3,
  },
});
