import { Image, StyleSheet, Text, View } from 'react-native';

import { icons } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// `tipo` decide ícono + color del círculo. Mezcla EventoRiego (tipo
// automatico/manual) y Alerta (tipo falla_sistema/nivel_agua_bajo/
// lectura_anomala) del contrato de API -- acá solo se resuelven los 3
// casos que ya se ven en el mockup; cuando se conecte la API real, los
// demás tipos de alerta se pueden ir agregando a este mismo mapa.
const TIPO_CONFIG = {
  riego_automatico: { icon: icons.gotaAgua, bg: colors.primary },
  riego_manual: { icon: icons.gotaAgua, bg: '#3B82C4' },
  alerta: { icon: icons.informacion, bg: colors.warning },
};

// Una fila de la lista "Registros recientes" de Historial: círculo de
// color + ícono a la izquierda, título + descripción al medio, hora a
// la derecha (mockup).
export default function HistorialRecordItem({ tipo, titulo, descripcion, horaTexto }) {
  const config = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.alerta;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
        <Image source={config.icon} style={styles.icon} resizeMode="contain" />
      </View>

      <View style={styles.textColumn}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
      </View>

      <Text style={styles.hora}>{horaTexto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  titulo: {
    ...typography.body,
    fontFamily: 'Inter_600SemiBold',
    fontSize: moderateScale(14),
  },
  descripcion: {
    ...typography.caption,
    marginTop: 2,
  },
  hora: {
    ...typography.caption,
    fontSize: moderateScale(11),
  },
});
