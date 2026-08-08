import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PressableScale from './PressableScale';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Botón verde sólido: "Iniciar sesión", "Registrarse", "Siguiente", etc.
// `icon` es opcional (ej. "add" para "+ Vincular dispositivo" en Monitoreo).
export function PrimaryButton({ label, onPress, style, disabled = false, icon }) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, disabled && styles.disabled, style]}
    >
      <View style={styles.contentRow}>
        {icon && (
          <Ionicons
            name={icon}
            size={moderateScale(18)}
            color={colors.textOnPrimary}
            style={styles.icon}
          />
        )}
        <Text style={typography.button}>{label}</Text>
      </View>
    </PressableScale>
  );
}

// Botón outline verde: "Registrarse" en la pantalla de Bienvenida.
export function SecondaryButton({ label, onPress, style }) {
  return (
    <PressableScale onPress={onPress} style={[styles.secondary, style]}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  secondaryLabel: {
    ...typography.button,
    color: colors.primaryDark,
  },
});
