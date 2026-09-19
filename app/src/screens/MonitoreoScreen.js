import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PlantGreetingBanner from '../components/PlantGreetingBanner';
import PlantPhoto from '../components/PlantPhoto';
import StatChip from '../components/StatChip';
import { PrimaryButton } from '../components/Buttons';
import PressableScale from '../components/PressableScale';
import {
  EMPTY_STATE_GAP_AFTER_HEADER,
  EMPTY_STATE_GAP_AFTER_IMAGE,
  EMPTY_STATE_IMAGE_SIZE,
  emptyStateStyles,
} from '../constants/emptyState';
import { icons } from '../constants/images';
import { DISPOSITIVO_ID } from '../constants/device';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { activarRiegoAPI, analizarEstadoRiegoAPI, getUltimaLecturaAPI } from '../services/api';

const PLANT_PHOTO_SIZE = EMPTY_STATE_IMAGE_SIZE;

// Cada cuánto se refresca la lectura mientras la pantalla está
// abierta. No es tiempo real instantáneo (para eso haría falta el
// socket 'nueva_lectura', que implica agregar socket.io-client), pero
// para el dashboard es suficientemente frecuente.
const INTERVALO_REFRESCO_MS = 10000;

// Umbrales simples para mostrar "Óptimo"/"Alta"/"Baja", etc. Son un
// primer criterio razonable, no vienen de ningún dato de la planta
// todavía (eso depende del umbral por especie, que es un pendiente de
// backend/firmware más grande, ver CONTEXTO_CONTINUIDAD.md).
function estadoHumedadSuelo(valor) {
  if (valor < 20) return 'Baja';
  if (valor > 70) return 'Alta';
  return 'Óptimo';
}

function estadoTemperatura(valor) {
  if (valor < 15) return 'Fría';
  if (valor > 30) return 'Alta';
  return 'Ideal';
}

function estadoHumedadAmbiente(valor) {
  if (valor < 30) return 'Seca';
  if (valor > 80) return 'Muy alta';
  return 'Buena';
}

function confirmarRiego({ lectura, humedadAlta }, nombrePlanta) {
  if (!humedadAlta) return Promise.resolve(true);

  return new Promise((resolve) => {
    Alert.alert(
      'Humedad alta',
      `${nombrePlanta} registra ${lectura.humedadSuelo}% de humedad, por encima de su umbral. ¿Quieres regar de todas formas?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Regar de todas formas', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

export default function MonitoreoScreen({ navigation }) {
  const { plantas } = useAppState();
  const plantaEnMonitoreo = plantas.some((planta) => planta.enMonitoreo);
  if (!plantaEnMonitoreo) {
    return <SinPlanta navigation={navigation} />;
  }
  return <ConDispositivo navigation={navigation} />;
}

function SinDispositivo({ navigation }) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();

  return (
    <View style={styles.plainContainer}>
      <ScrollView
        contentContainerStyle={styles.emptyStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bannerSection, { paddingTop: insets.top + spacing.md }]}>
          <PlantGreetingBanner nombre={usuario?.nombre} />
        </View>

        <View style={styles.plantPhotoWrapper}>
          <PlantPhoto size={PLANT_PHOTO_SIZE} />
        </View>

        <Text style={styles.emptyTitle}>Kit no conectado</Text>
        <Text style={styles.emptyDescription}>
          Enciende tu kit SUWA y conecta el teléfono a la misma red para
          comenzar a recibir lecturas.
        </Text>
      </ScrollView>
    </View>
  );
}

function SinPlanta({ navigation }) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();

  return (
    <View style={styles.plainContainer}>
      <ScrollView
        contentContainerStyle={styles.emptyStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bannerSection, { paddingTop: insets.top + spacing.md }]}>
          <PlantGreetingBanner nombre={usuario?.nombre} kitConectado />
        </View>

        <View style={styles.plantPhotoWrapper}>
          <PlantPhoto size={PLANT_PHOTO_SIZE} />
        </View>

        <Text style={styles.emptyTitle}>Planta no seleccionada</Text>
        <Text style={styles.emptyDescription}>
          Selecciona tu planta en la pantalla de Mis plantas para comenzar
          el monitoreo y habilitar el riego automático.
        </Text>

        <PrimaryButton
          label="Seleccionar planta"
          icon="leaf-outline"
          onPress={() => navigation.navigate('MisPlantas')}
          style={styles.linkButton}
        />
      </ScrollView>
    </View>
  );
}

function ConDispositivo({ navigation }) {
  const insets = useSafeAreaInsets();
  const { alertasVisibles, plantas } = useAppState();
  const { usuario } = useAuth();
  const planta = plantas.find((item) => item.enMonitoreo) || plantas[0];
  const alertasNoLeidas = alertasVisibles.filter((a) => !a.leida).length;

  const [lectura, setLectura] = useState(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [regando, setRegando] = useState(false);

  const cargarUltimaLectura = useCallback(async () => {
    try {
      const respuesta = await getUltimaLecturaAPI(DISPOSITIVO_ID);
      setLectura(respuesta.data);
      setErrorCarga(false);
    } catch (error) {
      // Si ya teníamos una lectura previa, la dejamos en pantalla en
      // vez de reemplazarla por un error -- es mejor mostrar el
      // último dato conocido que una pantalla rota mientras el
      // backend/la placa estén momentáneamente caídos.
      if (!lectura) {
        setErrorCarga(true);
      }
    } finally {
      setCargandoInicial(false);
    }
  }, [lectura]);

  useEffect(() => {
    cargarUltimaLectura();
    const intervalo = setInterval(cargarUltimaLectura, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
    // Solo se arma una vez al montar; cargarUltimaLectura ya captura
    // el valor más reciente de "lectura" en cada llamada por closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegarAhora = async () => {
    if (regando) return; // Evita doble-tap mientras ya hay un riego en curso
    setRegando(true);
    try {
      const analisis = await analizarEstadoRiegoAPI(
        DISPOSITIVO_ID,
        planta.umbralHumedadMinimo
      );
      const continuar = await confirmarRiego(analisis, planta.nombreComun);
      if (!continuar) return;
      await activarRiegoAPI(DISPOSITIVO_ID, 10);
      Alert.alert('Riego activado', 'La orden de riego manual se envió al kit.');
    } catch (error) {
      const mensaje = error.code === 'LECTURA_KIT_DESACTUALIZADA'
        ? 'No hay una lectura reciente del kit. Espera unos segundos y vuelve a intentarlo.'
        : error.code === 'BACKEND_LOCAL_NO_DISPONIBLE'
          ? 'La app no pudo comunicarse con el backend local que consulta la placa. '
            + 'Inicia el backend en el PC y verifica que ambos dispositivos estén en la misma red.'
          : 'Revisa que el kit esté conectado e inténtalo de nuevo.';
      Alert.alert(
        'No se pudo activar el riego',
        mensaje
      );
    } finally {
      setRegando(false);
    }

  };

  if (cargandoInicial) {
    return (
      <View style={[styles.plainContainer, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (errorCarga) {
    return (
      <View style={[styles.plainContainer, styles.centered, styles.errorPadding]}>
        <Text style={typography.h2}>No se pudo cargar el monitoreo</Text>
        <Text style={[typography.body, styles.errorText]}>
          Revisa que el kit SUWA y el backend estén encendidos y conectados a la misma red.
        </Text>
        <PrimaryButton label="Reintentar" onPress={cargarUltimaLectura} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <View style={styles.plainContainer}>
      <ScrollView
        contentContainerStyle={styles.dashboardScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bannerOuter, { paddingTop: insets.top + spacing.md * 3 }]}>
          <View style={styles.bannerInner}>
            <PlantGreetingBanner nombre={usuario?.nombre} kitConectado />
          </View>
          <PressableScale
            onPress={() => navigation.navigate('Alertas')}
            style={styles.bellButton}
            hitSlop={10}
          >
            <Ionicons name="notifications-outline" size={moderateScale(20)} color={colors.textDark} />
            {alertasNoLeidas > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{alertasNoLeidas}</Text>
              </View>
            )}
          </PressableScale>
        </View>

        <View style={styles.plantCard}>
          <Text style={styles.plantCardTitle}>{planta.nombreComun}</Text>
          <View style={styles.estadoPill}>
            <View style={styles.estadoDot} />
            <Text style={styles.estadoText}>Estado: saludable</Text>
          </View>

          <PlantPhoto size={PLANT_PHOTO_SIZE} source={planta.foto} />
        </View>

        <View style={styles.statsRow}>
          <StatChip
            icon={icons.gotaAgua}
            value={lectura.humedadSuelo}
            unit="%"
            status={estadoHumedadSuelo(lectura.humedadSuelo)}
          />
          <StatChip
            icon={icons.temperaturaAlta}
            value={lectura.temperatura}
            unit="°C"
            status={estadoTemperatura(lectura.temperatura)}
          />
          <StatChip
            icon={icons.soleado}
            value={lectura.humedadAmbiente}
            unit="%"
            status={estadoHumedadAmbiente(lectura.humedadAmbiente)}
          />
        </View>

        <PrimaryButton
          label={regando ? 'Regando...' : 'Regar ahora'}
          onPress={handleRegarAhora}
          disabled={regando}
          style={styles.regarButton}
        />

        <Text style={styles.automationCaption}>
          Riego automático según el umbral de la planta
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  plainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorPadding: {
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  retryButton: {
    marginTop: spacing.lg,
    minWidth: 160,
  },
  emptyStateScroll: {
    paddingBottom: spacing.xl,
  },
  bannerSection: {
    paddingHorizontal: spacing.lg,
  },
  bannerOuter: {
    paddingHorizontal: spacing.lg,
    position: 'relative',
    zIndex: 10,
    elevation: 10,
  },
  bannerInner: {
    position: 'relative',
  },
  bellButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: moderateScale(15),
    height: moderateScale(15),
    borderRadius: moderateScale(8),
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  bellBadgeText: {
    color: colors.textOnPrimary,
    fontSize: moderateScale(9),
    fontWeight: '700',
  },
  plantPhotoWrapper: {
    alignItems: 'center',
    marginTop: EMPTY_STATE_GAP_AFTER_HEADER,
    marginBottom: EMPTY_STATE_GAP_AFTER_IMAGE,
  },
  emptyTitle: emptyStateStyles.title,
  emptyDescription: emptyStateStyles.description,
  linkButton: emptyStateStyles.button,
  dashboardScroll: {
    paddingBottom: spacing.xl,
  },
  plantCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  plantCardTitle: {
    ...typography.h2,
    alignSelf: 'center',
  },
  estadoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  estadoDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  estadoText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  regarButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  automationCaption: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});