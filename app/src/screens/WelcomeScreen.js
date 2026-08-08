import { Image, StyleSheet, Text, View } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { illustrations } from '../constants/images';
import { spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale, screen } from '../utils/responsive';

// El asset ya no tiene el fondo gris de estudio (se le quitó con
// procesamiento de imagen), así que ya no hace falta recortarlo en un
// círculo -- se muestra "flotando" directo sobre el degradado, igual
// que en el mockup. El ancho de referencia es bastante grande (85% de
// pantalla) porque así se ve en Figma; el alto sale solo respetando la
// proporción real de la foto (aspectRatio), para que no se vea estirada.
const HERO_ASPECT_RATIO = 672 / 900;
const HERO_WIDTH = Math.min(screen.width * 0.85, 380);

// Pantalla "Bienvenido a SUWA" (mockup 5): título, ilustración del kit,
// y los dos accesos a Registro / Login.
export default function WelcomeScreen({ navigation }) {
  return (
    <GradientBackground style={styles.container} variant="welcome">
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido{'\n'}a SUWA</Text>

        <Image
          source={illustrations.welcomeHero}
          style={styles.hero}
          resizeMode="contain"
        />
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
    flex: 1,
  },
  // El bloque de título + imagen se centra en TODO el espacio disponible
  // (entre el borde superior y los botones). Con el título más grande y
  // la imagen más grande, el grupo ocupa más alto, así que queda menos
  // hueco vacío y los botones terminan más arriba que antes -- sin
  // necesitar un spacer aparte.
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingHorizontal: spacing.md,
  },
  hero: {
    width: HERO_WIDTH,
    height: HERO_WIDTH / HERO_ASPECT_RATIO,
    marginTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    fontSize: moderateScale(46),
    lineHeight: moderateScale(50),
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
