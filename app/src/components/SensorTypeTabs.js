import { Image, StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { icons } from '../constants/images';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Los 2 sensores que sí existen como pestañas separadas en el mockup
// corregido: Humedad (humedadSuelo) y Temperatura. La pestaña
// "Temperatura" en realidad muestra 2 líneas juntas (temperatura +
// humedadAmbiente) porque son "la temperatura relativa" -- humedad y
// temperatura del aire se leen como una sola métrica combinada, no como
// sensores separados. Por eso `sensors` es un array: 1 elemento para
// Humedad, 2 para Temperatura (ver HistorialChart, que ya soporta
// varias series).
export const SENSOR_TYPES = [
  {
    key: 'humedadSuelo',
    label: 'Humedad',
    icon: icons.gotaAgua,
    sensors: [{ field: 'humedadSuelo', label: 'Humedad suelo', unit: '%', color: colors.primary }],
  },
  {
    key: 'temperatura',
    label: 'Temperatura',
    icon: icons.temperaturaAlta,
    sensors: [
      { field: 'temperatura', label: 'Temperatura', unit: '°C', color: colors.warning },
      { field: 'humedadAmbiente', label: 'Humedad ambiente', unit: '%', color: '#3B82C4' },
    ],
  },
];

// Fila de 3 chips (ícono + label) para elegir qué sensor mostrar en la
// gráfica de abajo. El seleccionado se resalta en negrita + color del
// sensor; los otros quedan en gris, igual que el mockup.
export default function SensorTypeTabs({ value, onChange }) {
  return (
    <View style={styles.row}>
      {SENSOR_TYPES.map((sensor) => {
        const active = sensor.key === value;
        const tabColor = sensor.sensors[0].color;
        return (
          <PressableScale
            key={sensor.key}
            onPress={() => onChange(sensor.key)}
            style={styles.tab}
          >
            <Image
              source={sensor.icon}
              style={[styles.icon, { tintColor: active ? tabColor : colors.textMuted }]}
              resizeMode="contain"
            />
            <Text style={[styles.label, active && { color: tabColor, fontFamily: 'Inter_600SemiBold' }]}>
              {sensor.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    width: moderateScale(16),
    height: moderateScale(16),
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
