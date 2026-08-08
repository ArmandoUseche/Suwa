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

      {/* Antes el bloque de arriba se centraba en TODO el alto
          disponible, lo que dejaba un hueco enorme y parejo arriba y
          abajo -- el título terminaba muy arriba y los botones muy
          abajo. Ahora el contenido se queda cerca del top (como en el
          mockup) y este spacer flexible absorbe el resto del espacio,
          empujando los botones hacia abajo pero sin tanto padding de
          más como antes -- quedan más arriba que antes. */}
      <View style={styles.spacer} />

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
    flex: 1,
  },
  content: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  spacer: {
    flex: 1,
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
    paddingBottom: spacing.lg,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});

