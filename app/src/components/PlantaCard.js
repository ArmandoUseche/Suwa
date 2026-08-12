import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PressableScale from './PressableScale';
import { icons } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Tarjeta de una planta en la lista de Mis Plantas. Dos variantes según
// `planta.enMonitoreo`:
//  - En monitoreo (conectada al kit físico ahora mismo): punto verde +
//    "kit suwa conectado" + humedad actual + botón "Ver monitoreo".
//  - Sin conectar (planta ya escaneada, pero el kit no está vinculado a
//    ELLA en este momento -- solo puede haber una planta en monitoreo a
//    la vez): punto gris + "Sin conectar", sin humedad, botón
//    "Ver detalle" en vez de "Ver monitoreo" (no hay nada en vivo que
//    mostrar todavía).
export default function PlantaCard({ planta, onPress }) {
  const { nombreComun, foto, enMonitoreo, humedadActual, humedadEstado } = planta;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image source={foto} style={styles.foto} resizeMode="cover" />

        <View style={styles.infoColumn}>
          <View style={styles.nameRow}>
            <Text style={styles.nombre} numberOfLines={1}>
              {nombreComun}
            </Text>
            {/* Editar/eliminar -- mock por ahora (Paso 8), solo para no
                dejar la tarjeta "coja" respecto al mockup. */}
            <PressableScale
              onPress={() =>
                Alert.alert(nombreComun, undefined, [
                  { text: 'Editar', onPress: () => {} },
                  { text: 'Eliminar', style: 'destructive', onPress: () => {} },
                  { text: 'Cancelar', style: 'cancel' },
                ])
              }
              hitSlop={8}
            >
              <Ionicons name="ellipsis-vertical" size={moderateScale(18)} color={colors.textMuted} />
            </PressableScale>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: enMonitoreo ? colors.primary : colors.border }]} />
            <Text style={[styles.statusText, !enMonitoreo && styles.statusTextMuted]}>
              {enMonitoreo ? 'kit suwa conectado' : 'Sin conectar'}
            </Text>
          </View>

          {enMonitoreo && (
            <View style={styles.humedadRow}>
              <Image source={icons.gotaAgua} style={styles.gotaIcon} resizeMode="contain" />
              <Text style={styles.humedadValor}>{humedadActual}%</Text>
              <Text style={styles.humedadEstado}>{humedadEstado?.split(',')[0]}</Text>
            </View>
          )}
        </View>
      </View>

      <PressableScale onPress={onPress} style={styles.verButton}>
        <Text style={styles.verButtonLabel}>{enMonitoreo ? 'Ver monitoreo' : 'Ver detalle'}</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  foto: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: radius.md,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nombre: {
    ...typography.body,
    fontFamily: 'Inter_600SemiBold',
    fontSize: moderateScale(16),
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  statusTextMuted: {
    color: colors.textMuted,
  },
  humedadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  gotaIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
  },
  humedadValor: {
    ...typography.body,
    fontFamily: 'Inter_600SemiBold',
    fontSize: moderateScale(14),
  },
  humedadEstado: {
    ...typography.caption,
    color: colors.textMuted,
  },
  verButton: {
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  verButtonLabel: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
    fontSize: moderateScale(13),
  },
});
