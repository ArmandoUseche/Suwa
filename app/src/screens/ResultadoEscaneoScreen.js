import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeaderPill from '../components/ScreenHeaderPill';
import StatChip from '../components/StatChip';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { icons, illustrations } from '../constants/images';
import { useAppState } from '../context/AppStateContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { escanearPlantaAPI } from '../services/api';

export default function ResultadoEscaneoScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { fotoUri } = route.params ?? {};
  const { agregarPlanta } = useAppState();
  const [etapa, setEtapa] = useState('identificando'); // identificando | calculando | listo | rechazado
  const [identificacion, setIdentificacion] = useState(null);
  const [parametros, setParametros] = useState(null);
  const [mensajeRechazo, setMensajeRechazo] = useState('');

  useEffect(() => {
    if (!fotoUri) return;

    // Cambia a "calculando" después de 2s para mejor UX mientras espera la API
    const timerCalculando = setTimeout(() => {
      setEtapa((prev) => (prev === 'identificando' ? 'calculando' : prev));
    }, 2000);

    escanearPlantaAPI(fotoUri)
      .then((res) => {
        clearTimeout(timerCalculando);
        setIdentificacion(res.data.identificacion);
        setParametros(res.data.parametros);
        setEtapa('listo');
      })
      .catch((error) => {
        clearTimeout(timerCalculando);
        const data = error.response?.data;

        if (data?.rechazado) {
          setMensajeRechazo(data.error);
          setEtapa('rechazado');
        } else {
          Alert.alert(
            'Error',
            data?.error || 'No se pudo escanear la planta. Intenta de nuevo.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      });

    return () => clearTimeout(timerCalculando);
  }, [fotoUri]);

  const handleGuardar = async () => {
  try {
    await agregarPlanta({
      nombreComun: identificacion.nombreComun,
      nombreCientifico: identificacion.nombreCientifico,
      foto: fotoUri ? { uri: fotoUri } : illustrations.escanearEjemplo,
      luzIdeal: parametros.luzIdeal,
      temperaturaIdeal: parametros.temperaturaIdeal,
      umbralHumedadMinimo: parametros.umbralHumedadMinimo,
    });
    navigation.navigate('Main', { screen: 'MisPlantas' });
  } catch (error) {
    Alert.alert('Error', 'No se pudo guardar la planta. Intenta de nuevo.');
  }
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

        {/* Estado: cargando */}
        {(etapa === 'identificando' || etapa === 'calculando') && (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {etapa === 'identificando'
                ? 'Identificando tu planta...'
                : 'Calculando los parámetros de riego...'}
            </Text>
          </View>
        )}

        {/* Estado: rechazado por bajo porcentaje */}
        {etapa === 'rechazado' && (
          <View style={styles.loadingBlock}>
            <Text style={styles.rechazadoEmoji}>🌿</Text>
            <Text style={styles.rechazadoTitulo}>No pudimos identificarla</Text>
            <Text style={styles.rechazadoMensaje}>{mensajeRechazo}</Text>
            <SecondaryButton
              label="Escanear de nuevo"
              onPress={() => navigation.goBack()}
              style={styles.secondaryButton}
            />
          </View>
        )}

        {/* Estado: resultado exitoso */}
        {etapa === 'listo' && identificacion && parametros && (
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
              <StatChip
                icon={icons.soleado}
                value={parametros.luzIdeal}
                unit=""
                status="Luz"
              />
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
  rechazadoEmoji: {
    fontSize: moderateScale(48),
    marginBottom: spacing.md,
  },
  rechazadoTitulo: {
    ...typography.h1,
    fontSize: moderateScale(22),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  rechazadoMensaje: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: moderateScale(22),
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