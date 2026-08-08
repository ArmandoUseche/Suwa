import { ScrollView, StyleSheet, Text, View } from 'react-native';

import PlantGreetingBanner from '../components/PlantGreetingBanner';
import PlantPhoto from '../components/PlantPhoto';
import StatChip from '../components/StatChip';
import { PrimaryButton } from '../components/Buttons';
import { icons } from '../constants/images';
import {
  mockEstadoPlanta,
  mockEstadosLectura,
  mockTieneDispositivoVinculado,
  mockUltimaLectura,
  mockUsuario,
} from '../constants/mockData';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Tamaño de la foto circular de la planta. Se comparte entre los dos
// estados; la cantidad que se superpone sobre el banner (en el estado
// sin vincular) se calcula a partir de este mismo valor, así siempre
// quedan proporcionados entre sí aunque cambie el tamaño.
const PLANT_PHOTO_SIZE = moderateScale(120);

// Pantalla de Monitoreo (Paso 5).
//
// Tiene DOS estados, según si el usuario ya vinculó un dispositivo:
//  - Sin vincular (mockTieneDispositivoVinculado = false, mockup real):
//    banner de saludo + "¡Comencemos, {nombre}!" + botón para vincular.
//    Este es el estado inicial real para un usuario nuevo, así que es
//    el que se ve por defecto ahora mismo.
//  - Vinculado: tarjeta "Planta" con foto + estado, 3 chips de lecturas,
//    botón "Regar ahora" y aviso de próximo riego automático.
// Cuando exista el flujo real de vincular dispositivo (Paso 7, Mis
// Plantas), `mockTieneDispositivoVinculado` deja de ser mock y pasa a
// salir de si el usuario tiene o no una Planta asociada.
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

        {/* Superpuesta sobre el borde inferior del banner (no debajo,
            con un espacio) para que banner + foto se lean como una sola
            forma tipo cápsula, igual que en el mockup. */}
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
        <PlantGreetingBanner nombre={mockUsuario.nombre} kitConectado />

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

        <PrimaryButton label="Regar ahora" onPress={() => {}} style={styles.regarButton} />

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
  plantPhotoWrapper: {
    alignItems: 'center',
    // La mitad de la foto queda "adentro" del banner (superpuesta) y la
    // otra mitad afuera -- por eso el margen negativo es la mitad del
    // tamaño de la foto.
    marginTop: -PLANT_PHOTO_SIZE / 2,
    marginBottom: spacing.lg,
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
    alignSelf: 'flex-start',
  },
  estadoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
