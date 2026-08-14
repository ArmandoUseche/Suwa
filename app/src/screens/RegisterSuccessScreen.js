import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton } from '../components/Buttons';
import { logo } from '../constants/images';
import { colors, spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale } from '../utils/responsive';

// Cuánto dura la pantalla de carga entre "Iniciar sesión" y llegar de
// verdad al Login -- mismo criterio que SPLASH_DURATION_MS en
// SplashScreen.js, pero un poco más corta (esto es una transición
// intermedia, no la primera impresión de la app).
const CARGA_DURATION_MS = 1100;

// Pantalla "¡Cuenta creada con éxito!" (mockup 7). Las dos chispitas
// verdes hacen un pop-in con rebote en vez de aparecer estáticas.
//
// Al tocar "Iniciar sesión" no se navega directo -- primero se muestra
// una pantalla de carga (mismo logo + fade que SplashScreen, la
// primera pantalla que se ve al abrir la app) y recién después se
// entra a Login. Es la secuencia que se pidió: confirmación → carga →
// login.
export default function RegisterSuccessScreen({ navigation }) {
  const [etapa, setEtapa] = useState('confirmacion'); // confirmacion | cargando
  const bigSparkScale = useRef(new Animated.Value(0)).current;
  const smallSparkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(bigSparkScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(smallSparkScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [bigSparkScale, smallSparkScale, contentOpacity]);

  useEffect(() => {
    if (etapa !== 'cargando') return;

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, CARGA_DURATION_MS);

    return () => clearTimeout(timer);
  }, [etapa, navigation, logoOpacity, logoScale]);

  if (etapa === 'cargando') {
    return (
      <GradientBackground style={styles.container}>
        <Animated.Image
          source={logo.mark}
          style={[styles.loadingLogo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.sparksRow}>
        <Animated.View
          style={{ transform: [{ scale: bigSparkScale }] }}
        >
          <Ionicons name="sparkles" size={moderateScale(40)} color={colors.primaryDark} />
        </Animated.View>
        <Animated.View
          style={[
            styles.smallSparkWrapper,
            { transform: [{ scale: smallSparkScale }] },
          ]}
        >
          <Ionicons name="sparkles" size={moderateScale(24)} color={colors.primary} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        <Text style={styles.title}>¡Cuenta creada con éxito!</Text>
        <Text style={styles.subtitle}>
          Verifica tu correo electrónico para confirmar tu cuenta.
        </Text>

        <PrimaryButton
          label="Iniciar sesión"
          onPress={() => setEtapa('cargando')}
          style={styles.button}
        />
      </Animated.View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sparksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  smallSparkWrapper: {
    marginLeft: spacing.sm,
  },
  content: {
    width: '100%',
    maxWidth: contentMaxWidth,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 220,
    width: '100%',
  },
  loadingLogo: {
    width: moderateScale(96),
    height: moderateScale(138),
    tintColor: '#FFFFFF',
  },
});
