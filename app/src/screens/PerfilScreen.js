import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 8): reemplazar por la pantalla real de Perfil.
export default function PerfilScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Perfil (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
