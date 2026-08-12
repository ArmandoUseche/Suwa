import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeaderPill from '../components/ScreenHeaderPill';
import PlantaCard from '../components/PlantaCard';
import { PrimaryButton } from '../components/Buttons';
import {
  EMPTY_STATE_GAP_AFTER_HEADER,
  EMPTY_STATE_GAP_AFTER_IMAGE,
  EMPTY_STATE_IMAGE_SIZE,
  emptyStateStyles,
} from '../constants/emptyState';
import { illustrations } from '../constants/images';
import { mockPlantas, mockTieneDispositivoVinculado, mockTienePlantas } from '../constants/mockData';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Pantalla de Mis Plantas (Paso 7). A diferencia de Historial/Escanear,
// tiene 3 estados (no 2): el kit conectado y el haber agregado plantas
// son 2 cosas independientes entre sí -- podés tener el kit vinculado
// hace rato y aun así no haber escaneado ninguna planta todavía.
//  1. Sin kit vinculado -> CTA "Vincular dispositivo" (mismo criterio
//     que Monitoreo/Historial/Escanear).
//  2. Con kit, sin plantas -> "Sin registros aún" (mockup real).
//  3. Con plantas -> lista de tarjetas (PlantaCard).
export default function MisPlantasScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  if (!mockTieneDispositivoVinculado) {
    return (
      <EstadoVacio
        insets={insets}
        titulo="Vincula tu kit para empezar"
        descripcion="Necesitás tu kit SUWA conectado para poder escanear y monitorear tus plantas."
        botonLabel="Vincular dispositivo"
        botonIcon="add"
        onBotonPress={() => {}}
      />
    );
  }

  if (!mockTienePlantas) {
    return (
      <EstadoVacio
        insets={insets}
        titulo="Sin registros aún"
        descripcion="Escanea tu primera planta con nuestra IA para identificar su especie, conocer sus necesidades de sol y agua, y empezar a cuidarla."
        botonLabel="Agregar planta"
        botonIcon="add"
        onBotonPress={() => navigation.navigate('Escanear')}
      />
    );
  }

  const enMonitoreo = mockPlantas.find((p) => p.enMonitoreo);
  const resto = mockPlantas.filter((p) => !p.enMonitoreo);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeaderPill title="Mis plantas" />
        </View>

        {enMonitoreo && (
          <>
            <View style={styles.sectionPill}>
              <Text style={styles.sectionPillText}>Planta en monitoreo</Text>
            </View>
            <PlantaCard
              planta={enMonitoreo}
              onPress={() => navigation.navigate('PlantaDetalle', { plantaId: enMonitoreo.id })}
            />
          </>
        )}

        {resto.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Otras plantas</Text>
            <View style={styles.otrasList}>
              {resto.map((planta) => (
                <PlantaCard
                  key={planta.id}
                  planta={planta}
                  onPress={() => navigation.navigate('PlantaDetalle', { plantaId: planta.id })}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Compartida entre el estado "sin kit" y "sin plantas" -- mismos
// tamaños que Monitoreo/Historial/Escanear (constants/emptyState.js),
// solo cambia el ícono/texto/botón.
function EstadoVacio({ insets, titulo, descripcion, botonLabel, botonIcon, onBotonPress }) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.emptyScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerSection, { paddingTop: insets.top + spacing.md }]}>
          <ScreenHeaderPill title="Mis plantas" />
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={illustrations.misPlantasVacio}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.description}>{descripcion}</Text>

        <PrimaryButton
          label={botonLabel}
          icon={botonIcon}
          onPress={onBotonPress}
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // --- Estados vacíos (sin kit / sin plantas) ---
  emptyScroll: {
    paddingBottom: spacing.xl,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: EMPTY_STATE_GAP_AFTER_HEADER,
    marginBottom: EMPTY_STATE_GAP_AFTER_IMAGE,
  },
  image: {
    width: EMPTY_STATE_IMAGE_SIZE,
    height: EMPTY_STATE_IMAGE_SIZE * 0.6,
  },
  title: emptyStateStyles.title,
  description: emptyStateStyles.description,
  button: emptyStateStyles.button,

  // --- Lista con plantas ---
  listScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  sectionPillText: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primaryDark,
    fontSize: moderateScale(13),
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: moderateScale(16),
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  otrasList: {
    gap: spacing.sm,
  },
});
