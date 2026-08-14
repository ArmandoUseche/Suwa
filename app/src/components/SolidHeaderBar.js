import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from './PressableScale';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Header verde sólido con flecha de volver + título, usado en las
// pantallas "secundarias" que se abren desde Perfil (Cambiar
// contraseña, Configuración, Notificaciones, Términos, Privacidad,
// Contáctanos -- mockup real de Cambiar contraseña y Configuración).
// Ya estaba previsto en theme.js (colors.headerGreen, comentado como
// "Escanear, Historial, Configuración") aunque Escanear/Historial
// terminaron usando el pill con borde en vez de esto -- acá sí es
// donde corresponde.
export default function SolidHeaderBar({ title, onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <PressableScale onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={moderateScale(24)} color="#FFFFFF" />
      </PressableScale>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: moderateScale(24) }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.headerGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    fontSize: moderateScale(18),
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
});
