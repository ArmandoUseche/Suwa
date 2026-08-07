import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { colors } from '../constants/theme';

// Fondo degradado verde que se repite en splash, onboarding y bienvenida.
// Lo sacamos a un componente propio para no repetir el LinearGradient
// con los mismos colores en cada pantalla.
export default function GradientBackground({ children, style }) {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
