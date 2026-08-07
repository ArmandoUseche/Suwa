import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { logo } from '../constants/images';
import { moderateScale } from '../utils/responsive';

// Cuánto dura el splash antes de pasar al onboarding. Lo dejamos como
// constante para poder ajustarlo fácil si se siente muy largo/corto.
const SPLASH_DURATION_MS = 1600;

export default function SplashScreen({ navigation }) {
  // El logo entra con un fade + escala sutil en vez de aparecer de golpe.
  // Esto también ayuda a disimular que es una imagen JPEG comprimida:
  // al no quedarse estático, se nota menos cualquier artefacto de compresión.
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation, opacity, scale]);

  return (
    <GradientBackground style={styles.container}>
      <Animated.Image
        source={logo.mark}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: moderateScale(96),
    height: moderateScale(138),
    tintColor: '#FFFFFF',
  },
});
