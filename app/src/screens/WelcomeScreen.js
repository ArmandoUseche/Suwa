import { Image, StyleSheet, Text, View } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { illustrations } from '../constants/images';
import { colors, spacing, typography } from '../constants/theme';
import { contentMaxWidth, screen } from '../utils/responsive';

const HERO_SIZE = Math.min(screen.width * 0.68, 300);

// Pantalla "Bienvenido a SUWA" (mockup 5): ilustración del kit,
// título, y los dos accesos a Registro / Login.
export default function WelcomeScreen({ navigation }) {
  return (
    <GradientBackground style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroCircle}>
          <Image
            source={illustrations.welcomeHero}
            style={styles.hero}
            resizeMode="cover"
          />
        </View>

        <Text style={[typography.h1, styles.title]}>Bienvenido{'\n'}a SUWA</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Iniciar sesión"
          onPress={() => navigation.navigate('Login')}
        />
        <SecondaryButton
          label="Registrarse"
          onPress={() => navigation.navigate('Register')}
          style={styles.secondaryButton}
        />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingTop: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  // La foto del kit viene con fondo gris de estudio (no transparente).
  // La recortamos en un círculo, igual que las ilustraciones del
  // onboarding, para que ese fondo gris no se vea como un rectángulo
  // suelto flotando sobre el degradado verde.
  heroCircle: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    borderRadius: HERO_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  title: {
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});

