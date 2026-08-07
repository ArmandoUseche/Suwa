import { StyleSheet, Text } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import { typography } from '../constants/theme';

// TODO(paso 7): reemplazar por la pantalla real de Escanear.
export default function EscanearScreen() {
  return (
    <GradientBackground style={styles.container}>
      <Text style={typography.h2}>Escanear (en construcción)</Text>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
