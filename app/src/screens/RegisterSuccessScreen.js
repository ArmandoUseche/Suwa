import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton } from '../components/Buttons';
import { colors, spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale } from '../utils/responsive';

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
});
