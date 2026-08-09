import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeaderPill from '../components/ScreenHeaderPill';
import PeriodSelector from '../components/PeriodSelector';
import SensorTypeTabs, { SENSOR_TYPES } from '../components/SensorTypeTabs';
import HistorialChart from '../components/HistorialChart';
import HistorialRecordItem from '../components/HistorialRecordItem';
import { PrimaryButton } from '../components/Buttons';
import {
  EMPTY_STATE_GAP_AFTER_HEADER,
  EMPTY_STATE_GAP_AFTER_IMAGE,
  EMPTY_STATE_IMAGE_SIZE,
  emptyStateStyles,
} from '../constants/emptyState';
import { illustrations } from '../constants/images';
import {
  mockLecturasSemana,
  mockRegistrosRecientes,
  mockTieneDatosHistorial,
} from '../constants/mockData';
import { colors, spacing, typography } from '../constants/theme';
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
        <View style={[styles.headerSection, { paddingTop: insets.top + spacing.md }]}>
          <ScreenHeaderPill title="Historial" />
        </View>

        <View style={styles.emptyIllustrationWrapper}>
          <View style={styles.emptyIllustrationBlob} />
          <Image
            source={illustrations.historialVacio}
            style={styles.emptyIllustrationImage}
            resizeMode="contain"
          />
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

  const sensorType = SENSOR_TYPES.find((s) => s.key === sensorKey);
  const labels = mockLecturasSemana.map((l) => l.dia);
  // Cada sensor de la pestaña activa se convierte en una serie de la
  // gráfica -- 1 para Humedad, 2 (temperatura + humedad ambiente) para
  // Temperatura.
  const series = sensorType.sensors.map((s) => ({
    label: s.label,
    unit: s.unit,
    color: s.color,
    values: mockLecturasSemana.map((l) => l[s.field]),
  }));

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
          <HistorialChart labels={labels} series={series} />
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
  // Sin paddingHorizontal acá: el padding lateral va en headerSection y
  // en los estilos de emptyStateStyles (título/descripción/botón), para
  // que coincida exactamente con cómo lo arma Monitoreo (bannerSection
  // con su propio padding, no el ScrollView entero).
  emptyScroll: {
    paddingBottom: spacing.xl,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
  },
  emptyIllustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: EMPTY_STATE_GAP_AFTER_HEADER,
    marginBottom: EMPTY_STATE_GAP_AFTER_IMAGE,
  },
  // Mancha circular mint detrás de la ilustración, como el círculo
  // detrás de la foto de la planta en Monitoreo -- mismo lenguaje
  // visual. Mismo tamaño que la imagen central (EMPTY_STATE_IMAGE_SIZE)
  // para que ocupe la misma "caja" que PlantPhoto en Monitoreo.
  emptyIllustrationBlob: {
    position: 'absolute',
    width: EMPTY_STATE_IMAGE_SIZE,
    height: EMPTY_STATE_IMAGE_SIZE,
    borderRadius: EMPTY_STATE_IMAGE_SIZE / 2,
    backgroundColor: colors.surface,
  },
  emptyIllustrationImage: {
    width: EMPTY_STATE_IMAGE_SIZE * 0.9,
    height: EMPTY_STATE_IMAGE_SIZE * 0.9,
  },
  emptyTitle: emptyStateStyles.title,
  emptyDescription: emptyStateStyles.description,
  linkButton: emptyStateStyles.button,

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
