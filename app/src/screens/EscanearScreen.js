import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHeaderPill from '../components/ScreenHeaderPill';
import ViewfinderFrame from '../components/ViewfinderFrame';
import { PrimaryButton } from '../components/Buttons';
import {
  EMPTY_STATE_GAP_AFTER_HEADER,
  EMPTY_STATE_GAP_AFTER_IMAGE,
  EMPTY_STATE_IMAGE_SIZE,
  emptyStateStyles,
} from '../constants/emptyState';
import { illustrations } from '../constants/images';
import { useAppState } from '../context/AppStateContext';
import { colors, radius, spacing } from '../constants/theme';

// Intro de Escanear (Paso 7). Mismo esqueleto que Monitoreo/Historial
// (header + imagen central + título + descripción + botón, con las
// constantes compartidas de emptyState.js) para que las 3 pantallas se
// vean del mismo tamaño y proporciones.
//
// Reusa tieneDispositivoVinculado del AppStateContext compartido (misma
// bandera de Monitoreo, ya no es un mock fijo -- se actualiza en vivo
// al vincular un kit real): sin kit vinculado no tiene sentido escanear
// todavía (no hay dónde guardar el resultado), así que el CTA cambia a
// "Vincular dispositivo" en vez de "Escanear ahora".
export default function EscanearScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { tieneDispositivoVinculado } = useAppState();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerSection, { paddingTop: insets.top + spacing.md }]}>
          <ScreenHeaderPill title="Escanear" />
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={illustrations.escanearEjemplo}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Superpuesto con margen negativo (mismo tamaño que la
              imagen, tirado hacia arriba esa misma altura) en vez de
              position:absolute -- ver ViewfinderFrame.js para el
              porqué. */}
          <ViewfinderFrame
            size={EMPTY_STATE_IMAGE_SIZE}
            color={colors.primary}
            style={styles.frameOverlap}
          />
        </View>

        <Text style={styles.title}>Identifica tu planta en segundos</Text>

        {tieneDispositivoVinculado ? (
          <>
            <Text style={styles.description}>
              Toma una foto para detectar su especie y conocer los
              parámetros óptimos de sol y agua que necesita.
            </Text>
            <PrimaryButton
              label="Escanear ahora"
              onPress={() => navigation.navigate('EscanearCamara')}
              style={styles.button}
            />
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Primero necesitás vincular tu kit SUWA para poder guardar
              los resultados del escaneo en tu planta.
            </Text>
            <PrimaryButton
              label="Vincular dispositivo"
              icon="add"
              onPress={() => navigation.navigate('VincularDispositivo')}
              style={styles.button}
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
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: EMPTY_STATE_GAP_AFTER_HEADER,
    marginBottom: EMPTY_STATE_GAP_AFTER_IMAGE,
  },
  image: {
    width: EMPTY_STATE_IMAGE_SIZE,
    height: EMPTY_STATE_IMAGE_SIZE,
    borderRadius: radius.lg,
  },
  frameOverlap: {
    marginTop: -EMPTY_STATE_IMAGE_SIZE,
  },
  title: emptyStateStyles.title,
  description: emptyStateStyles.description,
  button: emptyStateStyles.button,
});
