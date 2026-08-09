import { StyleSheet, Text, View } from 'react-native';

import { EMPTY_STATE_HEADER_HEIGHT } from '../constants/emptyState';
import { colors, radius } from '../constants/theme';
import { moderateVerticalScale } from '../utils/responsive';

// Caja de título con borde verde redondeado, usada como header de
// pantallas que no tienen un header sólido (Historial, y más adelante
// Escanear/Mis plantas "primera vez" -- se ve el mismo patrón en los 3
// mockups del flujo). Mismo alto que PlantGreetingBanner
// (EMPTY_STATE_HEADER_HEIGHT, un solo valor compartido entre las dos)
// para que el contenedor de arriba se vea del mismo tamaño en todas las
// pantallas, tengan o no foto de fondo.
//
// El texto usa la misma fuente que el saludo "Hola, {nombre}" del
// banner de Monitoreo (RozhaOne). Acá no hay foto de fondo, así que en
// vez de blanco va en verde, centrado en la caja (el banner lo pone
// abajo por el degradado sobre la foto; acá no hace falta ese truco).
export default function ScreenHeaderPill({ title }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: EMPTY_STATE_HEADER_HEIGHT,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: moderateVerticalScale(20),
  },
  title: {
    fontFamily: 'RozhaOne_400Regular',
    fontSize: moderateVerticalScale(28),
    color: colors.primaryDark,
  },
});
