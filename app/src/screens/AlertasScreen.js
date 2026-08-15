import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SolidHeaderBar from '../components/SolidHeaderBar';
import AlertaItem from '../components/AlertaItem';
import { useAppState } from '../context/AppStateContext';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Centro de alertas (se llega desde la campanita del dashboard de
// Monitoreo). Quedó pendiente desde el Paso 5 -- el ícono con el
// contador de no leídas ya existía en la idea original, pero la
// pantalla a la que debía llevar nunca se construyó. El endpoint del
// contrato (GET /api/alertas/:dispositivoId, PATCH /api/alertas/:id/leida)
// ya estaba definido desde el principio; lo que faltaba era esto.
export default function AlertasScreen({ navigation }) {
  const { alertas, marcarAlertaLeida } = useAppState();

  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Alertas" onBack={() => navigation.goBack()} />

      {alertas.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={moderateScale(40)} color={colors.textMuted} />
          <Text style={styles.emptyText}>No tienes alertas por ahora.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {alertas.map((alerta) => (
            <AlertaItem
              key={alerta.id}
              tipo={alerta.tipo}
              mensaje={alerta.mensaje}
              leida={alerta.leida}
              timestamp={alerta.timestamp}
              onPress={() => marcarAlertaLeida(alerta.id)}
            />
          ))}
        </ScrollView>
      )}
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
    gap: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
