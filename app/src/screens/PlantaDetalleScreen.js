import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HistorialChart from '../components/HistorialChart';
import ProgramarRiegoSheet from '../components/ProgramarRiegoSheet';
import PressableScale from '../components/PressableScale';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { icons } from '../constants/images';
import { mockPlantas } from '../constants/mockData';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Últimas 24h de humedad, mock -- cuando se conecte la API real, sale
// del historial de LecturaSensor filtrado a las últimas 24h en vez de
// estar fijo acá (mismo campo humedadSuelo del contrato, nada nuevo).
const mockHumedad24h = {
  labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
  valores: [22, 20, 24, 28, 25, 25],
};

// Detalle de una planta (Paso 7, se llega desde "Ver monitoreo"/"Ver
// detalle" en la lista de Mis Plantas). Recibe `plantaId` por parámetro
// de navegación y busca la planta en el mock -- cuando se conecte la
// API real, este mismo patrón cambia a un GET por id en vez de un
// .find() sobre un array fijo.
export default function PlantaDetalleScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { plantaId } = route.params ?? {};
  const planta = mockPlantas.find((p) => p.id === plantaId) ?? mockPlantas[0];
  const [showProgramarRiego, setShowProgramarRiego] = useState(false);

  const handleRegarAhora = () => {
    // Mock -- mismo criterio que "Regar ahora" en el dashboard de
    // Monitoreo (POST /api/riego/activar cuando se conecte).
    Alert.alert('Riego activado', `Se activó el riego manual de ${planta.nombreComun}.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <PressableScale onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={moderateScale(26)} color={colors.textDark} />
          </PressableScale>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {planta.nombreComun}
          </Text>
          <View style={{ width: moderateScale(26) }} />
        </View>

        <Image source={planta.foto} style={styles.foto} resizeMode="cover" />

        {planta.enMonitoreo ? (
          <>
            <View style={styles.historySection}>
              <View style={styles.historyHeaderRow}>
                <Text style={styles.historyTitle}>History</Text>
                <Text style={styles.historySubtitle}>Último 24h</Text>
              </View>
              <HistorialChart
                labels={mockHumedad24h.labels}
                series={[{ label: 'Humedad', unit: '%', color: colors.primary, values: mockHumedad24h.valores }]}
              />
              <Text style={styles.luzText}>Luz: {planta.luzIdeal}</Text>
            </View>

            <View style={styles.actionsRow}>
              <PrimaryButton
                label="Regar ahora"
                icon="water"
                onPress={handleRegarAhora}
                style={styles.actionButton}
              />
              <SecondaryButton
                label="Programar riego"
                onPress={() => setShowProgramarRiego(true)}
                style={styles.actionButton}
              />
            </View>

            <View style={styles.humedadBlock}>
              <Text style={styles.humedadLabel}>
                Humedad: <Text style={styles.humedadValor}>{planta.humedadActual}%</Text>
              </Text>
              <Text style={styles.humedadEstado}>({planta.humedadEstado})</Text>
            </View>

            <View style={styles.kitRow}>
              <Image source={icons.estadoSenal} style={styles.kitIcon} resizeMode="contain" />
              <View>
                <Text style={styles.kitTitle}>Kit SUWA</Text>
                <Text style={styles.kitStatus}>
                  {planta.kitConexion === 'estable' ? 'Conexión estable' : 'Conexión inestable'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.sinMonitoreoBlock}>
            <Text style={styles.sinMonitoreoText}>
              Esta planta no está conectada al kit ahora mismo, así que
              no hay datos en vivo para mostrar. Conectá el kit a esta
              planta desde Monitoreo para empezar a verla acá.
            </Text>
            <Text style={styles.luzText}>Luz ideal: {planta.luzIdeal}</Text>
          </View>
        )}

        {/* Centro de alertas / umbrales -- placeholder por ahora
            (Paso 8), la configuración real todavía no está construida. */}
        <View style={styles.configSection}>
          <PressableScale
            onPress={() => Alert.alert('Centro de alertas', 'Se conecta más adelante.')}
            style={styles.configRow}
          >
            <Ionicons name="notifications-outline" size={moderateScale(20)} color={colors.textDark} />
            <Text style={styles.configLabel}>Centro de alertas</Text>
            <Ionicons name="chevron-forward" size={moderateScale(18)} color={colors.textMuted} />
          </PressableScale>
          <PressableScale
            onPress={() => Alert.alert('Configurar umbrales', 'Se conecta más adelante.')}
            style={styles.configRow}
          >
            <Ionicons name="options-outline" size={moderateScale(20)} color={colors.textDark} />
            <Text style={styles.configLabel}>Configurar umbrales de riego</Text>
            <Ionicons name="chevron-forward" size={moderateScale(18)} color={colors.textMuted} />
          </PressableScale>
        </View>
      </ScrollView>

      <ProgramarRiegoSheet
        visible={showProgramarRiego}
        onClose={() => setShowProgramarRiego(false)}
        nombrePlanta={planta.nombreComun}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  topBarTitle: {
    ...typography.h2,
    fontSize: moderateScale(18),
    flex: 1,
    textAlign: 'center',
  },
  foto: {
    width: '100%',
    height: moderateScale(280),
  },
  historySection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    ...typography.h2,
    fontSize: moderateScale(17),
  },
  historySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  luzText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  humedadBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  humedadLabel: {
    ...typography.body,
    color: colors.textDark,
  },
  humedadValor: {
    fontFamily: 'Inter_600SemiBold',
  },
  humedadEstado: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  kitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  kitIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
  },
  kitTitle: {
    ...typography.body,
    fontFamily: 'Inter_500Medium',
    fontSize: moderateScale(14),
  },
  kitStatus: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  sinMonitoreoBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sinMonitoreoText: {
    ...typography.body,
    color: colors.textMuted,
  },
  configSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  configLabel: {
    ...typography.body,
    fontSize: moderateScale(14),
    flex: 1,
  },
});
