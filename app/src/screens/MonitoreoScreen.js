import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 5): reemplazar por la pantalla real de Monitoreo.
export default function MonitoreoScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Monitoreo (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
