import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import SolidHeaderBar from '../components/SolidHeaderBar';
import { useAppState } from '../context/AppStateContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const OPCIONES_INICIALES = [
  { key: 'riego', label: 'Alertas de riego', descripcion: 'Cuando el kit riegue automáticamente.' },
  { key: 'humedad', label: 'Humedad baja', descripcion: 'Cuando el suelo esté por debajo del umbral.' },
  { key: 'sistema', label: 'Alertas del sistema', descripcion: 'Fallas del kit o pérdida de conexión.' },
];
export default function NotificacionesScreen({ navigation }) {
  const { preferenciasNotificaciones: valores, actualizarPreferenciaNotificacion } = useAppState();

  const toggle = (key) => {
    actualizarPreferenciaNotificacion(key, !valores[key]);
  };

  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Notificaciones" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {OPCIONES_INICIALES.map((opcion, i) => (
            <View key={opcion.key}>
              <View style={styles.row}>
                <View style={styles.textColumn}>
                  <Text style={styles.label}>{opcion.label}</Text>
                  <Text style={styles.descripcion}>{opcion.descripcion}</Text>
                </View>
                <Switch
                  value={valores[opcion.key]}
                  onValueChange={() => toggle(opcion.key)}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {i < OPCIONES_INICIALES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  textColumn: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    ...typography.body,
    fontSize: moderateScale(14),
    fontFamily: 'Inter_500Medium',
  },
  descripcion: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
