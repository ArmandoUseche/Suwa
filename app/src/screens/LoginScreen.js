import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 3): reemplazar por la pantalla real "¡Hola de nuevo!" con
// los campos de correo/contraseña.
export default function LoginScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Login (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
