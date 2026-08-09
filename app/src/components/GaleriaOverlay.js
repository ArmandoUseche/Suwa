import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

import PressableScale from './PressableScale';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const COLUMNS = 3;
const GAP = 2;

// Overlay de "Recientes" (mockup de Escanear): pide permiso de galería
// y muestra las últimas fotos del dispositivo en una grilla de 3
// columnas, cada una con un circulito de selección arriba a la derecha.
// Se abre encima de la cámara, sin salir de la pantalla de Escanear
// (mismo patrón que ConsejosSheet).
export default function GaleriaOverlay({ visible, onClose, onSelect }) {
  const [assets, setAssets] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | denied | ready

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    (async () => {
      setStatus('loading');
      const current = await MediaLibrary.getPermissionsAsync();
      let granted = current.granted;
      if (!granted && current.canAskAgain) {
        const requested = await MediaLibrary.requestPermissionsAsync();
        granted = requested.granted;
      }
      if (cancelled) return;
      if (!granted) {
        setStatus('denied');
        return;
      }
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: 30,
      });
      if (cancelled) return;
      setAssets(result.assets);
      setStatus('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.header}>
        <PressableScale onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={moderateScale(24)} color={colors.textDark} />
        </PressableScale>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Recientes</Text>
          <Ionicons name="chevron-down" size={moderateScale(16)} color={colors.textDark} />
        </View>
        <View style={{ width: moderateScale(24) }} />
      </View>

      {status === 'denied' && (
        <View style={styles.centerMessage}>
          <Text style={styles.messageText}>
            SUWA necesita permiso para acceder a tus fotos y poder elegir
            una desde acá. Podés habilitarlo en los ajustes del celular.
          </Text>
        </View>
      )}

      {status === 'ready' && (
        <FlatList
          data={assets}
          key={COLUMNS}
          numColumns={COLUMNS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => onSelect(item.uri)}
              style={styles.cell}
              scaleTo={0.97}
            >
              <Image source={{ uri: item.uri }} style={styles.cellImage} />
              <View style={styles.selectDot} />
            </PressableScale>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: moderateScale(17),
  },
  centerMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  messageText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: GAP,
  },
  cell: {
    flex: 1 / COLUMNS,
    aspectRatio: 1,
    margin: GAP,
  },
  cellImage: {
    width: '100%',
    height: '100%',
  },
  selectDot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
