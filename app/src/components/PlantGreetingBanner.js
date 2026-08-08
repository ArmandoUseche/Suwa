import { ImageBackground, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { illustrations } from '../constants/images';
import { radius, spacing, typography } from '../constants/theme';
import { moderateVerticalScale } from '../utils/responsive';

// Banner "Hola, {nombre}" de Monitoreo (mockup): una foto de hojas de
// fondo, recortada con esquinas redondeadas, con un degradado oscuro
// abajo para que el texto blanco se lea bien encima de la foto (sin el
// degradado, sobre hojas claras el texto blanco se pierde).
export default function PlantGreetingBanner({ nombre }) {
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
    fontSize: moderateVerticalScale(24),
  },
});
