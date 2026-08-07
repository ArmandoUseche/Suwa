import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 3): reemplazar por la pantalla real "¡Cuenta creada con éxito!"
// con las chispitas animadas y el botón Iniciar sesión.
export default function RegisterSuccessScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Cuenta creada (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
