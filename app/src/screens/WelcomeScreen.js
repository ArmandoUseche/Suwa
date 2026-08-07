import { Image, StyleSheet, Text, View } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { illustrations } from '../constants/images';
import { spacing, typography } from '../constants/theme';

// Pantalla "Bienvenido a SUWA" (mockup 5): ilustración del kit,
// título, y los dos accesos a Registro / Login.
export default function WelcomeScreen({ navigation }) {
  return (
    <GradientBackground style={styles.container}>
      <View style={styles.content}>
        <Image
          source={illustrations.welcomeHero}
          style={styles.hero}
          resizeMode="contain"
        />

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
    paddingTop: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  hero: {
    width: '80%',
    height: 260,
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});
