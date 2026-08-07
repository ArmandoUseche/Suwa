import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 3): reemplazar por la pantalla real "Bienvenido a SUWA"
// con los botones de Iniciar sesión / Registrarse.
export default function WelcomeScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Bienvenida (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
