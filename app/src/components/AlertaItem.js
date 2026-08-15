import { Image, StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { icons } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatearTiempoRelativo } from '../utils/formatters';
import { moderateScale } from '../utils/responsive';

// Ícono + color de círculo por tipo de Alerta (mismo campo `tipo` del
// contrato de API: falla_sistema/nivel_agua_bajo/lectura_anomala).
const TIPO_CONFIG = {
  nivel_agua_bajo: { icon: icons.gotaAgua, bg: colors.warning },
  lectura_anomala: { icon: icons.informacion, bg: colors.warning },
  falla_sistema: { icon: icons.destello, bg: colors.danger },
};

// Una fila de AlertasScreen. Mismo lenguaje visual que
// HistorialRecordItem (círculo de color + ícono, texto, hora) para que
// la app se sienta consistente, con el agregado del punto de "no
// leída" -- tocar la fila la marca como leída (mock, real es
// PATCH /api/alertas/:id/leida).
export default function AlertaItem({ tipo, mensaje, leida, timestamp, onPress }) {
  const config = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.falla_sistema;

  return (
    <PressableScale onPress={onPress} style={styles.card} scaleTo={0.98}>
      <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
        <Image source={config.icon} style={styles.icon} resizeMode="contain" />
      </View>

      <View style={styles.textColumn}>
        <Text style={[styles.mensaje, !leida && styles.mensajeNoLeida]}>{mensaje}</Text>
        <Text style={styles.hora}>{formatearTiempoRelativo(timestamp)}</Text>
      </View>

      {!leida && <View style={styles.dot} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrapper: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: moderateScale(18),
    height: moderateScale(18),
    tintColor: colors.textOnPrimary,
  },
  textColumn: {
    flex: 1,
  },
  mensaje: {
    ...typography.body,
    fontSize: moderateScale(14),
    color: colors.textMuted,
  },
  // Sin leer se ve más "presente" (más oscuro, semi-negrita) para que
  // sea fácil distinguir de un vistazo qué falta leer, sin depender
  // solo del punto verde.
  mensajeNoLeida: {
    color: colors.textDark,
    fontFamily: 'Inter_600SemiBold',
  },
  hora: {
    ...typography.caption,
    fontSize: moderateScale(11),
    marginTop: 2,
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: colors.primary,
    marginTop: moderateScale(4),
  },
});
