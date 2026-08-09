import { Image, StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { icons } from '../constants/images';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Los 3 sensores que sí existen en el modelo real LecturaSensor del
// backend (humedadSuelo, temperatura, humedadAmbiente). El mockup de
// Figma tenía una 3ra pestaña "Luz", pero ese campo no está en el
// contrato de API -- se reemplaza acá por "Ambiente" (humedadAmbiente),
// que sí es un dato real que el backend manda.
export const SENSOR_TYPES = [
  { key: 'humedadSuelo', label: 'Humedad', icon: icons.gotaAgua, unit: '%', color: colors.primary },
  { key: 'temperatura', label: 'Temp.', icon: icons.temperaturaAlta, unit: '°C', color: colors.warning },
  { key: 'humedadAmbiente', label: 'Ambiente', icon: icons.soleado, unit: '%', color: '#3B82C4' },
];

// Fila de 3 chips (ícono + label) para elegir qué sensor mostrar en la
// gráfica de abajo. El seleccionado se resalta en negrita + color del
// sensor; los otros quedan en gris, igual que el mockup.
export default function SensorTypeTabs({ value, onChange }) {
  return (
    <View style={styles.row}>
      {SENSOR_TYPES.map((sensor) => {
        const active = sensor.key === value;
        return (
          <PressableScale
            key={sensor.key}
            onPress={() => onChange(sensor.key)}
            style={styles.tab}
          >
            <Image
              source={sensor.icon}
              style={[styles.icon, { tintColor: active ? sensor.color : colors.textMuted }]}
              resizeMode="contain"
            />
            <Text style={[styles.label, active && { color: sensor.color, fontFamily: 'Inter_600SemiBold' }]}>
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
