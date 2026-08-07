import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';

// Fondo degradado verde que se repite en splash, onboarding, bienvenida,
// login, registro, etc. Lo sacamos a un componente propio para no repetir
// el LinearGradient con los mismos colores en cada pantalla.
//
// El degradado se pinta de borde a borde (incluso detrás del notch/status
// bar) para que se vea "a pantalla completa", pero el contenido va dentro
// de un SafeAreaView para no quedar tapado por el notch, la cámara
// perforada o la barra de gestos. `edges` permite ajustar esto pantalla
// por pantalla si alguna no lo necesita (ej. un modal que ya vive dentro
// de otro contenedor seguro).
export default function GradientBackground({
  children,
  style,
  edges = ['top', 'bottom'],
}) {
  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
