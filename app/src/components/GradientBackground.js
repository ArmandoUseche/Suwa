import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { screen } from '../utils/responsive';

// Un círculo grande, mucho más ancho que la pantalla, posicionado a
// medias fuera del borde superior. Es el truco más simple para lograr
// una mancha "orgánica" (como las de Figma) sin necesitar una librería
// de SVG: solo se ve el arco inferior del círculo, y como el círculo es
// enorme comparado con la pantalla, ese arco se lee como una curva
// suave en vez de un círculo perfecto.
//
// Respira lentamente (escala 1 -> 1.04 -> 1, ~4.5s por tramo) para que
// el fondo tenga algo de vida sin ser una animación llamativa.
const BLOB_SIZE = screen.width * 1.6;

function Blob({ color, offsetTop, offsetLeft, opacity = 1 }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.04,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 4500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          top: offsetTop,
          left: offsetLeft,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

// Fondo compartido por casi toda la app. `variant` controla el look:
//  - 'gradient' (default): degradado diagonal claro -> medio, para
//    Splash, Login, Registro y Monitoreo.
//  - 'blob': fondo blanco con una mancha mint arriba (Onboarding).
//  - 'welcome': degradado de 3 tonos verdes + una mancha blanca sutil
//    encima, para la pantalla de Bienvenida.
export default function GradientBackground({
  children,
  style,
  edges = ['top', 'bottom'],
  variant = 'gradient',
}) {
  if (variant === 'blob') {
    return (
      <View style={styles.container}>
        <Blob
          color={colors.blobLight}
          offsetTop={-BLOB_SIZE * 0.58}
          offsetLeft={-BLOB_SIZE * 0.18}
        />
        <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
          {children}
        </SafeAreaView>
      </View>
    );
  }

  if (variant === 'welcome') {
    return (
      <LinearGradient
        colors={[colors.welcomeGradientTop, colors.welcomeGradientMid, colors.welcomeGradientBottom]}
        locations={[0, 0.55, 1]}
        style={styles.container}
      >
        {/* Antes el blob quedaba casi todo fuera de pantalla (arriba),
            se notaba muy poco y quedaba escondido detrás del título.
            Bajamos su posición para que su curva quede visible más o
            menos a la altura de la imagen del kit, y subimos la
            opacidad para que se note como un halo real. */}
        <Blob
          color="#FFFFFF"
          opacity={0.28}
          offsetTop={-BLOB_SIZE * 0.35}
          offsetLeft={-BLOB_SIZE * 0.2}
        />
        <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
          {children}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
  },
});
