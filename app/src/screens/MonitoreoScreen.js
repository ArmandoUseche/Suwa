import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PlantGreetingBanner from '../components/PlantGreetingBanner';
import { PrimaryButton } from '../components/Buttons';
import SensorCard from '../components/SensorCard';
import { icons } from '../constants/images';
import {
  mockAlertasNoLeidas,
  mockTieneDispositivoVinculado,
  mockUltimaLectura,
  mockUsuario,
} from '../constants/mockData';
import { colors, spacing, typography } from '../constants/theme';
import { formatearTiempoRelativo } from '../utils/formatters';
import { moderateScale } from '../utils/responsive';

// Pantalla de Monitoreo (Paso 5).
//
// Tiene DOS estados, según si el usuario ya vinculó un dispositivo:
//  - Sin vincular (mockTieneDispositivoVinculado = false, mockup real):
//    banner de saludo + "¡Comencemos, {nombre}!" + botón para vincular.
//    Este es el estado inicial real para un usuario nuevo, así que es
//    el que se ve por defecto ahora mismo.
//  - Vinculado: dashboard con las 3 tarjetas de sensores (lo que ya
//    estaba construido). Se deja el código listo para cuando exista el
//    flujo real de vincular dispositivo (Paso 7, Mis Plantas) — en ese
//    punto `mockTieneDispositivoVinculado` deja de ser mock y pasa a
//    salir de si el usuario tiene o no una Planta asociada.
export default function MonitoreoScreen() {
  if (!mockTieneDispositivoVinculado) {
    return <SinDispositivo />;
  }
  return <ConDispositivo />;
}

function SinDispositivo() {
  return (
    <View style={styles.plainContainer}>
      <ScrollView
        contentContainerStyle={styles.emptyStateScroll}
        showsVerticalScrollIndicator={false}
      >
        <PlantGreetingBanner nombre={mockUsuario.nombre} />

        {/* TODO: reemplazar por una foto real de la planta del usuario
            cuando exista ese asset / esa data; por ahora es un ícono
            de hoja como placeholder dentro del círculo mint. */}
        <View style={styles.plantCircle}>
          <Image
            source={icons.planta}
            style={styles.plantIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.emptyTitle}>¡Comencemos, {mockUsuario.nombre}!</Text>
        <Text style={styles.emptyDescription}>
          Vincula tu kit automatizado SUWA para empezar a monitorear tus
          sensores en tiempo real y programar tus riegos.
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

function ConDispositivo() {
  const lectura = mockUltimaLectura;

  return (
    <View style={styles.plainContainer}>
      <ScrollView
        contentContainerStyle={styles.dashboardScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Monitoreo</Text>
            <Text style={styles.subtitle}>
              Actualizado {formatearTiempoRelativo(lectura.timestamp)}
            </Text>
          </View>

          <Pressable style={styles.bellButton} hitSlop={10} onPress={() => {}}>
            <Image source={icons.notificacion} style={styles.bellIcon} resizeMode="contain" />
            {mockAlertasNoLeidas > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{mockAlertasNoLeidas}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.cardsGrid}>
          <SensorCard
            icon={icons.gotaAgua}
            label="Humedad del suelo"
            value={lectura.humedadSuelo}
            unit="%"
            accentColor={colors.primary}
          />
          <SensorCard
            icon={icons.temperaturaAlta}
            label="Temperatura"
            value={lectura.temperatura}
            unit="°C"
            accentColor={colors.warning}
          />
          <SensorCard
            icon={icons.gotaAgua}
            label="Humedad ambiente"
            value={lectura.humedadAmbiente}
            unit="%"
            accentColor={colors.primaryLight}
          />
        </View>
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
  plantCircle: {
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: moderateScale(70),
    backgroundColor: colors.surface,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -moderateScale(45),
    marginBottom: spacing.lg,
  },
  plantIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    tintColor: colors.primary,
  },
  emptyTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  linkButton: {
    marginHorizontal: spacing.lg,
  },
  dashboardScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    fontSize: moderateScale(24),
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  bellButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    tintColor: colors.headerGreen,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
