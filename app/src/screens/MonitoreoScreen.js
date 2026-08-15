import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import {
  mockEstadoPlanta,
  mockEstadosLectura,
  mockUltimaLectura,
  mockUsuario,
} from '../constants/mockData';
import { useAppState } from '../context/AppStateContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Tamaño de la foto circular de la planta. Viene de constants/emptyState
// (EMPTY_STATE_IMAGE_SIZE) para que Monitoreo, Historial y las que
// falten (Escanear/Mis plantas "primera vez") usen exactamente el mismo
// tamaño de imagen central -- antes cada pantalla tenía su propio
// número "parecido pero no igual".
const PLANT_PHOTO_SIZE = EMPTY_STATE_IMAGE_SIZE;

// Pantalla de Monitoreo (Paso 5).
//
// Tiene DOS estados, según si el usuario ya vinculó un dispositivo
// (tieneDispositivoVinculado, del AppStateContext compartido -- ya no
// es un mock fijo, se actualiza en vivo al vincular un kit real desde
// VincularDispositivoScreen, Paso 7):
//  - Sin vincular: banner de saludo + "¡Comencemos, {nombre}!" + botón
//    para vincular. Este es el estado inicial real para un usuario
//    nuevo.
//  - Vinculado: tarjeta "Planta" con foto + estado, 3 chips de lecturas,
//    botón "Regar ahora" y aviso de próximo riego automático.
export default function MonitoreoScreen({ navigation }) {
  const { tieneDispositivoVinculado } = useAppState();
  if (!tieneDispositivoVinculado) {
    return <SinDispositivo navigation={navigation} />;
  }
  return <ConDispositivo navigation={navigation} />;
}

function SinDispositivo({ navigation }) {
  // El banner no debe pegarse contra el notch/status bar -- en el
  // mockup flota con margen arriba. insets.top es el alto real del
  // notch/status bar de este dispositivo puntual.
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.plainContainer}>
      <ScrollView
        contentContainerStyle={styles.emptyStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bannerSection, { paddingTop: insets.top + spacing.md }]}>
          <PlantGreetingBanner nombre={mockUsuario.nombre} />
        </View>

        {/* Antes se superponía la mitad exacta de la foto sobre el
            banner (marginTop: -tamaño/2) y sin sombra propia, por lo que
            foto y banner se veían fundidos en un solo bloque. En el
            mockup la foto solo se mete un poco en el banner y flota
            claramente separada (sombra propia) sobre el fondo blanco.
            Menos overlap + sombra reproduce ese efecto. */}
        <View style={styles.plantPhotoWrapper}>
          <PlantPhoto size={PLANT_PHOTO_SIZE} />
        </View>

        <Text style={styles.emptyTitle}>¡Comencemos, {mockUsuario.nombre}!</Text>
        <Text style={styles.emptyDescription}>
          Vincula tu kit automatizado SUWA para empezar a monitorear tus
          sensores en tiempo real y programar tus riegos.
        </Text>

        <PrimaryButton
          label="Vincular dispositivo"
          icon="add"
          onPress={() => navigation.navigate('VincularDispositivo')}
          style={styles.linkButton}
        />
      </ScrollView>
    </View>
  );
}

function ConDispositivo({ navigation }) {
  const insets = useSafeAreaInsets();
  const lectura = mockUltimaLectura;
  const { alertas } = useAppState();
  const alertasNoLeidas = alertas.filter((a) => !a.leida).length;

  // Mismo criterio que "Regar ahora" en el detalle de planta
  // (PlantaDetalleScreen) -- antes acá no hacía nada al tocarlo, quedaba
  // inconsistente con esa otra pantalla. Real: POST /api/riego/activar
  // cuando se conecte (ver puntos-abiertos-backend.md).
  const handleRegarAhora = () => {
    Alert.alert('Riego activado', 'Se activó el riego manual.');
  };

  return (
    <View style={styles.plainContainer}>
      <ScrollView
        contentContainerStyle={styles.dashboardScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bannerOuter, { paddingTop: insets.top + spacing.md * 3 }]}>
          <View style={styles.bannerInner}>
            <PlantGreetingBanner nombre={mockUsuario.nombre} kitConectado />

            {/* Sin mockup puntual para esto -- el ícono de campanita
                estaba previsto desde el plan original ("el centro de
                alertas va como ícono de notificación en el header de
                Monitoreo") pero se perdió en el rediseño del
                dashboard. Se ubica acá, sobre el banner, en el mismo
                lugar donde Perfil pone su ícono de ajustes -- si
                aparece un mockup puntual para esto, se reacomoda
                fácil. `bannerInner` no tiene padding propio, así el
                `top`/`right` de acá quedan relativos al borde real del
                banner (si estuviera directo en `bannerOuter`, el
                paddingTop dinámico de arriba lo hubiera corrido más
                arriba de lo esperado). */}
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
        </View>

        <View style={styles.plantCard}>
          <Text style={styles.plantCardTitle}>Planta</Text>
          <View style={styles.estadoPill}>
            <View style={styles.estadoDot} />
            <Text style={styles.estadoText}>Estado: {mockEstadoPlanta.estado}</Text>
          </View>

          <PlantPhoto size={PLANT_PHOTO_SIZE} />
        </View>

        <View style={styles.statsRow}>
          <StatChip
            icon={icons.gotaAgua}
            value={lectura.humedadSuelo}
            unit="%"
            status={mockEstadosLectura.humedadSuelo}
          />
          <StatChip
            icon={icons.temperaturaAlta}
            value={lectura.temperatura}
            unit="°C"
            status={mockEstadosLectura.temperatura}
          />
          <StatChip
            icon={icons.soleado}
            value={lectura.humedadAmbiente}
            unit="%"
            status={mockEstadosLectura.humedadAmbiente}
          />
        </View>

        <PrimaryButton label="Regar ahora" onPress={handleRegarAhora} style={styles.regarButton} />

        <Text style={styles.automationCaption}>{mockEstadoPlanta.proximoRiegoTexto}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // El mockup de Monitoreo (a diferencia de Splash/Onboarding/Bienvenida)
  // es sobre fondo blanco liso, no el degradado verde — por eso acá no
  // se usa GradientBackground.
  plainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyStateScroll: {
    paddingBottom: spacing.xl,
  },
  // El banner "flota": no empieza pegado al notch (insets.top + margen
  // arriba, agregado dinámicamente) ni pegado a los bordes laterales
  // (paddingHorizontal acá).
  bannerSection: {
    paddingHorizontal: spacing.lg,
  },
  // Versión con campanita (estado conectado): el padding dinámico va en
  // el contenedor de afuera (bannerOuter); bannerInner no tiene padding
  // propio, así el botón absoluto queda pegado al borde real del
  // banner en vez de a un borde "corrido" por el padding.
  bannerOuter: {
    paddingHorizontal: spacing.lg,
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
