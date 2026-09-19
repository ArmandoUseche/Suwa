import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { useAppState } from '../context/AppStateContext';
import { getHistorialRiegoAPI, getHistorialSensoresAPI } from '../services/api';
import { DISPOSITIVO_ID } from '../constants/device';

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
  const { kitConectado } = useAppState();
  const [lecturas, setLecturas] = useState([]);
  const [riegos, setRiegos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    Promise.all([
      getHistorialSensoresAPI(DISPOSITIVO_ID),
      getHistorialRiegoAPI(DISPOSITIVO_ID),
    ])
      .then(([sensoresRes, riegoRes]) => {
        if (!activo) return;
        setLecturas(Array.isArray(sensoresRes.data) ? sensoresRes.data : []);
        setRiegos(Array.isArray(riegoRes.data) ? riegoRes.data : []);
      })
      .catch(() => {
        if (activo) {
          setLecturas([]);
          setRiegos([]);
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  if (lecturas.length === 0 && riegos.length === 0) {
    return <SinDatos kitConectado={kitConectado} />;
  }
  return <ConDatos lecturas={lecturas} riegos={riegos} />;
}

function SinDatos({ kitConectado }) {
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
          {/* Superpuesta con margen negativo (mismo truco que
              PlantPhoto en Monitoreo y el marco de Escanear) en vez de
              position:absolute -- ya encontramos 2 veces que un
              position:absolute sin top/left no se centra solo de forma
              confiable. */}
          <Image
            source={illustrations.historialVacio}
            style={[styles.emptyIllustrationImage, styles.emptyIllustrationImageOverlap]}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.emptyTitle}>
          {kitConectado ? 'Sin registros aún' : 'Kit no conectado'}
        </Text>
        <Text style={styles.emptyDescription}>
          {kitConectado
            ? 'Cuando el kit genere lecturas o ejecute un riego, aquí podrás ver la evolución de tus sensores y el registro de actividad.'
            : 'Enciende tu kit SUWA y conecta el teléfono a la misma red para comenzar a recibir lecturas.'}
        </Text>
      </ScrollView>
    </View>
  );
}

function ConDatos({ lecturas, riegos }) {
  const insets = useSafeAreaInsets();
  const [periodo, setPeriodo] = useState('Semana');
  const [sensorKey, setSensorKey] = useState('humedadSuelo');

  const datosPeriodo = useMemo(
    () => agruparLecturas(lecturas, periodo),
    [lecturas, periodo]
  );
  const sensorType = SENSOR_TYPES.find((s) => s.key === sensorKey);
  const labels = datosPeriodo.map((l) => l.label);
  const series = sensorType.sensors.map((s) => ({
    label: s.label,
    unit: s.unit,
    color: s.color,
    values: datosPeriodo.map((l) => l[s.field]),
  }));
  const registros = useMemo(
    () => construirRegistros(lecturas, riegos),
    [lecturas, riegos]
  );

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
          {datosPeriodo.length > 0 ? (
            <HistorialChart labels={labels} series={series} />
          ) : (
            <Text style={styles.sinLecturas}>No hay lecturas en este período.</Text>
          )}
        </View>

        <Text style={styles.recentTitle}>Registros recientes</Text>
        <View style={styles.recordsList}>
          {registros.map((registro) => (
            <HistorialRecordItem key={registro.id} {...registro} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function agruparLecturas(lecturas, periodo) {
  const ahora = Date.now();
  const duracion = periodo === 'Día'
    ? 24 * 60 * 60 * 1000
    : periodo === 'Semana'
      ? 7 * 24 * 60 * 60 * 1000
      : 365 * 24 * 60 * 60 * 1000;
  const filtradas = lecturas
    .filter((lectura) => ahora - new Date(lectura.timestamp).getTime() <= duracion)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const grupos = new Map();
  filtradas.forEach((lectura) => {
    const fecha = new Date(lectura.timestamp);
    const clave = periodo === 'Día'
      ? `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}-${fecha.getHours()}`
      : periodo === 'Semana'
        ? `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`
        : `${fecha.getFullYear()}-${fecha.getMonth()}`;
    const grupo = grupos.get(clave) || { valores: [], fecha };
    grupo.valores.push(lectura);
    grupos.set(clave, grupo);
  });

  return [...grupos.values()].map(({ valores, fecha }) => ({
    label: periodo === 'Día'
      ? `${String(fecha.getHours()).padStart(2, '0')}h`
      : periodo === 'Semana'
        ? fecha.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')
        : fecha.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
    humedadSuelo: promedio(valores, 'humedadSuelo'),
    temperatura: promedio(valores, 'temperatura'),
    humedadAmbiente: promedio(valores, 'humedadAmbiente'),
  }));
}

function promedio(valores, campo) {
  const numeros = valores.map((valor) => Number(valor[campo])).filter(Number.isFinite);
  if (numeros.length === 0) return 0;
  return Math.round(numeros.reduce((total, valor) => total + valor, 0) / numeros.length);
}

function construirRegistros(lecturas, riegos) {
  const registrosLecturas = lecturas.slice(0, 10).map((lectura) => ({
    id: `lectura-${lectura._id}`,
    tipo: 'alerta',
    titulo: 'Lectura registrada',
    descripcion: `Humedad del suelo: ${lectura.humedadSuelo}%`,
    horaTexto: formatearHora(lectura.timestamp),
    horaTimestamp: new Date(lectura.timestamp).getTime(),
  }));
  const registrosRiego = riegos.slice(0, 10).map((riego) => ({
    id: `riego-${riego._id}`,
    tipo: riego.tipo === 'manual' ? 'riego_manual' : 'riego_automatico',
    titulo: riego.tipo === 'manual' ? 'Riego manual' : 'Riego automático',
    descripcion: `${riego.duracionSegundos || 0} segundos de duración`,
    horaTexto: formatearHora(riego.timestamp),
    horaTimestamp: new Date(riego.timestamp).getTime(),
  }));

  return [...registrosLecturas, ...registrosRiego]
    .sort((a, b) => b.horaTimestamp - a.horaTimestamp)
    .slice(0, 10)
    .map(({ horaTimestamp, ...registro }) => registro);
}

function formatearHora(timestamp) {
  const fecha = new Date(timestamp);
  return Number.isNaN(fecha.getTime())
    ? 'Sin fecha'
    : fecha.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
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
  // para que ocupe la misma "caja" que PlantPhoto en Monitoreo. Ya NO
  // es position:absolute -- ver el comentario en el JSX.
  emptyIllustrationBlob: {
    width: EMPTY_STATE_IMAGE_SIZE,
    height: EMPTY_STATE_IMAGE_SIZE,
    borderRadius: EMPTY_STATE_IMAGE_SIZE / 2,
    backgroundColor: colors.surface,
  },
  emptyIllustrationImage: {
    width: EMPTY_STATE_IMAGE_SIZE * 0.9,
    height: EMPTY_STATE_IMAGE_SIZE * 0.9,
  },
  // Centra la imagen (más chica) verticalmente dentro del blob (más
  // grande): la sube la mitad de la suma de los 2 altos, así queda a
  // medio camino entre "pegada arriba del blob" y "pegada abajo".
  emptyIllustrationImageOverlap: {
    marginTop: -(EMPTY_STATE_IMAGE_SIZE + EMPTY_STATE_IMAGE_SIZE * 0.9) / 2,
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
  sinLecturas: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
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
