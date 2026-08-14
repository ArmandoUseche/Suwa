import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeaderPill from '../components/ScreenHeaderPill';
import StatChip from '../components/StatChip';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { icons, illustrations } from '../constants/images';
import { mockIdentificacionPlantNet, mockParametrosGemini } from '../constants/mockData';
import { useAppState } from '../context/AppStateContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Duración de cada etapa simulada (ver comentario grande más abajo).
const DURACION_IDENTIFICANDO = 1100;
const DURACION_CALCULANDO = 1100;

// Resultado del escaneo (Paso 7, sigue a EscanearCameraScreen). Recibe
// la foto capturada/elegida por parámetro de navegación (`fotoUri`).
//
// EL FLUJO REAL TIENE 2 IAS, NO UNA:
//  1. PlantNet identifica la especie -- se la llama 2 VECES seguidas
//     para confirmar que no fue casualidad (si no coinciden, se le
//     pediría otra foto a la persona en vez de mostrar un resultado
//     dudoso -- ese caso todavía no está manejado acá, queda para
//     cuando se conecte la API real).
//  2. Con la especie ya confirmada, se la manda a Gemini (otra IA,
//     prompteada para calcular los parámetros de riego). PlantNet NO
//     sabe nada de humedad/temperatura/luz -- son 2 fuentes de datos
//     separadas.
//
// Como todavía no hay API keys, acá se SIMULA esa secuencia con 2
// timers (identificando → calculando → listo) en vez de mostrar el
// resultado de golpe -- así la pantalla ya queda con la forma real que
// va a tener (2 etapas de carga, no 1), y cuando se conecten las APIs
// de verdad, cada timer se reemplaza por su llamada real en el mismo
// lugar (ver los comentarios "TODO" en handleIdentificar).
export default function ResultadoEscaneoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { fotoUri } = route.params ?? {};
  const { agregarPlanta } = useAppState();
  const [etapa, setEtapa] = useState('identificando'); // identificando | calculando | listo

  useEffect(() => {
    // TODO(cuando haya API keys): reemplazar esta secuencia simulada
    // por las llamadas reales, en el mismo orden:
    //   1. await PlantNet.identificar(fotoUri)  -- 2 veces, confirmar
    //      que coinciden
    //   2. await Gemini.calcularParametros(especieConfirmada)
    // Los mocks (mockIdentificacionPlantNet / mockParametrosGemini) ya
    // están separados en 2 objetos distintos justamente para que este
    // reemplazo sea directo, sin tener que reordenar nada acá.
    const t1 = setTimeout(() => setEtapa('calculando'), DURACION_IDENTIFICANDO);
    const t2 = setTimeout(() => setEtapa('listo'), DURACION_IDENTIFICANDO + DURACION_CALCULANDO);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const identificacion = mockIdentificacionPlantNet;
  const parametros = mockParametrosGemini;

  // Arma el objeto de planta con las 2 fuentes de datos por separado
  // (identificación de PlantNet + parámetros de Gemini) y lo agrega de
  // verdad a la lista de Mis Plantas -- ya no es un botón mock. Nace
  // "sin conectar" (enMonitoreo: false, ver comentario en
  // AppStateContext.agregarPlanta): agregarla acá no la vincula sola al
  // kit físico, eso es una acción aparte.
  const handleGuardar = () => {
    agregarPlanta({
      nombreComun: identificacion.nombreComun,
      nombreCientifico: identificacion.nombreCientifico,
      foto: fotoUri ? { uri: fotoUri } : illustrations.escanearEjemplo,
      luzIdeal: parametros.luzIdeal,
      temperaturaIdeal: parametros.temperaturaIdeal,
    });
    navigation.navigate('Main', { screen: 'MisPlantas' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerSection, { paddingTop: insets.top + spacing.md }]}>
          <ScreenHeaderPill title="Escanear" />
        </View>

        {fotoUri && (
          <Image source={{ uri: fotoUri }} style={styles.photo} resizeMode="cover" />
        )}

        {etapa !== 'listo' ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {etapa === 'identificando'
                ? 'Identificando tu planta...'
                : 'Calculando los parámetros de riego...'}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.nameBlock}>
              <Text style={styles.nombreComun}>{identificacion.nombreComun}</Text>
              <Text style={styles.nombreCientifico}>{identificacion.nombreCientifico}</Text>
              <View style={styles.coincidenciaPill}>
                <Text style={styles.coincidenciaText}>
                  {identificacion.coincidencia}% de coincidencia
                </Text>
              </View>
            </View>

            <Text style={styles.statsTitle}>Parámetros óptimos para esta planta</Text>
            <View style={styles.statsRow}>
              <StatChip
                icon={icons.gotaAgua}
                value={parametros.humedadIdeal}
                unit="%"
                status="Humedad"
              />
              <StatChip
                icon={icons.temperaturaAlta}
                value={parametros.temperaturaIdeal}
                unit="°C"
                status="Temperatura"
              />
              <StatChip icon={icons.soleado} value={parametros.luzIdeal} unit="" status="Luz" />
            </View>

            <PrimaryButton
              label="Añadir a mis plantas"
              icon="add"
              onPress={handleGuardar}
              style={styles.primaryButton}
            />
            <SecondaryButton
              label="Escanear otra vez"
              onPress={() => navigation.goBack()}
              style={styles.secondaryButton}
            />
          </>
        )}
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
    paddingBottom: spacing.xl,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  nameBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  nombreComun: {
    ...typography.h1,
    fontSize: moderateScale(26),
    color: colors.textDark,
    textAlign: 'center',
  },
  nombreCientifico: {
    ...typography.body,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  coincidenciaPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  coincidenciaText: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primaryDark,
  },
  statsTitle: {
    ...typography.body,
    fontFamily: 'Inter_500Medium',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    marginHorizontal: spacing.lg,
  },
});
