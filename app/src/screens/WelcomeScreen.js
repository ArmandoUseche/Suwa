import { Image, StyleSheet, Text, View } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { illustrations } from '../constants/images';
import { colors, spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale, screen } from '../utils/responsive';

const HERO_SIZE = Math.min(screen.width * 0.8, 340);

// Pantalla "Bienvenido a SUWA" (mockup 5): título, ilustración del kit,
// y los dos accesos a Registro / Login. El orden es título -> imagen
// (así está en el mockup, no al revés).
export default function WelcomeScreen({ navigation }) {
  return (
    <GradientBackground style={styles.container} variant="welcome">
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido{'\n'}a SUWA</Text>

        <View style={styles.heroCircle}>
          <Image
            source={illustrations.welcomeHero}
            style={styles.hero}
            resizeMode="cover"
          />
        </View>
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
    // El bloque de contenido ocupa todo el espacio disponible y centra
    // su contenido ahí adentro; los botones quedan pegados abajo porque
    // no tienen flex (les toca lo que sobra, no compiten por espacio).
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
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
    marginTop: spacing.lg,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.h1,
    fontSize: moderateScale(34),
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

