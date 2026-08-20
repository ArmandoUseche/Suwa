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
} from '../constants/mockData';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const PLANT_PHOTO_SIZE = EMPTY_STATE_IMAGE_SIZE;

export default function MonitoreoScreen({ navigation }) {
  const { tieneDispositivoVinculado } = useAppState();
  if (!tieneDispositivoVinculado) {
    return <SinDispositivo navigation={navigation} />;
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

        <Text style={styles.emptyTitle}>¡Comencemos, {usuario?.nombre}!</Text>
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
  const { usuario } = useAuth();
  const alertasNoLeidas = alertas.filter((a) => !a.leida).length;

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
            <PlantGreetingBanner nombre={usuario?.nombre} kitConectado />

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
  plainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyStateScroll: {
    paddingBottom: spacing.xl,
  },
  bannerSection: {
    paddingHorizontal: spacing.lg,
  },
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