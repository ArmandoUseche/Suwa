import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 3): reemplazar por el formulario real "¡Bienvenido! Crea tu
// cuenta en SUWA" (Nombre, Apellidos, correo/tel, contraseña, confirmar).
export default function RegisterScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Registro (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
