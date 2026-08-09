import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeaderPill from '../components/ScreenHeaderPill';
import PeriodSelector from '../components/PeriodSelector';
import SensorTypeTabs, { SENSOR_TYPES } from '../components/SensorTypeTabs';
import HistorialChart from '../components/HistorialChart';
import HistorialRecordItem from '../components/HistorialRecordItem';
import { PrimaryButton } from '../components/Buttons';
import {
  mockLecturasSemana,
  mockRegistrosRecientes,
  mockTieneDatosHistorial,
} from '../constants/mockData';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Pantalla de Historial (Paso 6).
//
// Tiene DOS estados, igual que Monitoreo pero con su propia bandera --
// un usuario puede tener el kit vinculado y aun así no tener ninguna
// lectura ni riego registrado todavía:
//  - Sin datos (mockTieneDatosHistorial = false, mockup real): ilustración
//    + "Sin registros aún" + botón para vincular dispositivo.
//  - Con datos: selector Día/Semana/Año + pestañas de sensor + gráfica
//    + lista de "Registros recientes".
export default function HistorialScreen() {
  if (!mockTieneDatosHistorial) {
    return <SinDatos />;
  }
  return <ConDatos />;
}

function SinDatos() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.emptyScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeaderPill title="Historial" />
        </View>

        <View style={styles.emptyIllustrationWrapper}>
          <View style={styles.emptyIllustrationBlob} />
          <View style={styles.emptyIllustrationCard}>
            <Ionicons name="bar-chart" size={moderateScale(48)} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.emptyTitle}>Sin registros aún</Text>
        <Text style={styles.emptyDescription}>
          Una vez que tu kit SUWA esté activo, aquí podrás ver las gráficas
          de evolución de tus sensores (humedad y temperatura) y el
          registro exacto de cada riego automatizado.
        </Text>

        <PrimaryButton
          label="Vincular dispositivo"
          icon="add"
          onPress={() => {}}
          style={styles.linkButton}
        />
      </ScrollView>
    </View>
  );
}

function ConDatos() {
  const insets = useSafeAreaInsets();
  const [periodo, setPeriodo] = useState('Semana');
  const [sensorKey, setSensorKey] = useState('humedadSuelo');

  const sensor = SENSOR_TYPES.find((s) => s.key === sensorKey);
  const labels = mockLecturasSemana.map((l) => l.dia);
  const values = mockLecturasSemana.map((l) => l[sensorKey]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.dataScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeaderPill title="Historial" />
        </View>

        <View style={styles.periodSection}>
          <PeriodSelector value={periodo} onChange={setPeriodo} />
        </View>

        <View style={styles.sensorTabsSection}>
          <SensorTypeTabs value={sensorKey} onChange={setSensorKey} />
        </View>

        <View style={styles.chartSection}>
          <HistorialChart labels={labels} values={values} lineColor={sensor.color} />
        </View>

        <Text style={styles.recentTitle}>Registros recientes</Text>
        <View style={styles.recordsList}>
          {mockRegistrosRecientes.map((registro) => (
            <HistorialRecordItem key={registro.id} {...registro} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Igual que Monitoreo: fondo blanco liso, no el degradado verde --
  // por eso acá tampoco se usa GradientBackground.
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // --- Estado sin datos ---
  emptyScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyIllustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl,
  },
  // Mancha circular mint detrás de la tarjeta, como el círculo detrás de
  // la foto de la planta en Monitoreo -- mismo lenguaje visual.
  emptyIllustrationBlob: {
    position: 'absolute',
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
    backgroundColor: colors.surface,
  },
  emptyIllustrationCard: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  linkButton: {},

  // --- Estado con datos ---
  dataScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  periodSection: {
    marginTop: spacing.lg,
  },
  sensorTabsSection: {
    marginTop: spacing.lg,
  },
  chartSection: {
    marginTop: spacing.md,
  },
  recentTitle: {
    ...typography.h2,
    fontSize: moderateScale(17),
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  recordsList: {
    gap: spacing.sm,
  },
});
