import { Text } from 'react-native';
import { StyleSheet } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, spacing, typography } from '../constants/theme';

// Botón verde sólido: "Iniciar sesión", "Registrarse", "siguiente", etc.
export function PrimaryButton({ label, onPress, style, disabled = false }) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, disabled && styles.disabled, style]}
    >
      <Text style={typography.button}>{label}</Text>
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
