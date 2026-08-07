import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton } from '../components/Buttons';
import { colors, spacing, typography } from '../constants/theme';

// Pantalla "¡Cuenta creada con éxito!" (mockup 7). Las dos chispitas
// verdes hacen un pop-in con rebote en vez de aparecer estáticas.
export default function RegisterSuccessScreen({ navigation }) {
  const bigSparkScale = useRef(new Animated.Value(0)).current;
  const smallSparkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

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

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.sparksRow}>
        <Animated.Text
          style={[styles.sparkBig, { transform: [{ scale: bigSparkScale }] }]}
        >
          ✦
        </Animated.Text>
        <Animated.Text
          style={[
            styles.sparkSmall,
            { transform: [{ scale: smallSparkScale }] },
          ]}
        >
          ✦
        </Animated.Text>
      </View>

      <Animated.View style={{ opacity: contentOpacity }}>
        <Text style={styles.title}>¡Cuenta creada con éxito!</Text>
        <Text style={styles.subtitle}>
          Verifica tu correo electrónico para confirmar tu cuenta.
        </Text>

        <PrimaryButton
          label="Iniciar sesión"
          onPress={() => navigation.replace('Login')}
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
  sparkBig: {
    fontSize: 40,
    color: colors.primaryDark,
    marginRight: spacing.sm,
  },
  sparkSmall: {
    fontSize: 24,
    color: colors.primary,
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
  },
});
