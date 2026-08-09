import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { illustrations } from '../constants/images';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale, moderateVerticalScale } from '../utils/responsive';

// Banner "Hola, {nombre}" de Monitoreo (mockup): una foto de hojas de
// fondo, recortada con esquinas redondeadas, con un degradado oscuro
// abajo para que el texto blanco se lea bien encima de la foto (sin el
// degradado, sobre hojas claras el texto blanco se pierde).
//
// `kitConectado`: cuando el usuario ya tiene un dispositivo vinculado,
// el mockup agrega una fila "● kit conectado" debajo del saludo.
export default function PlantGreetingBanner({ nombre, kitConectado = false }) {
  return (
    <ImageBackground
      source={illustrations.monitoreoSaludoBg}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.45)']}
        style={styles.overlay}
      >
        <Text style={styles.greeting}>Hola, {nombre}.</Text>
        {kitConectado && (
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>kit conectado</Text>
          </View>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: moderateVerticalScale(150),
  },
  bannerImage: {
    borderRadius: radius.lg,
  },
  overlay: {
    flex: 1,
    borderRadius: radius.lg,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  greeting: {
    ...typography.h1,
    color: '#FFFFFF',
    fontSize: moderateVerticalScale(28),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
    backgroundColor: colors.primaryLight,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: '#FFFFFF',
  },
});
