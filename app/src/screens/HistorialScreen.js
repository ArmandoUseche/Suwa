import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 6): reemplazar por la pantalla real de Historial.
export default function HistorialScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Historial (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
