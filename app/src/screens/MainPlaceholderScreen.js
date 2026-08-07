import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 4): reemplazar por el bottom tab navigator real
// (Monitoreo, Historial, Escanear, Mis plantas, Perfil).
export default function MainPlaceholderScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>¡Sesión iniciada! 🌱</Text>
      <Text style={typography.body}>
        Las tabs principales se arman en el Paso 4.
      </Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 8 },
});
