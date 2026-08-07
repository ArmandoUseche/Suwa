import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';

// Botón verde sólido: "Iniciar sesión", "Registrarse", "siguiente", etc.
export function PrimaryButton({ label, onPress, style, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, disabled && styles.disabled, style]}
    >
      <Text style={typography.button}>{label}</Text>
    </Pressable>
  );
}

// Botón outline verde: "Registrarse" en la pantalla de Bienvenida.
export function SecondaryButton({ label, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.secondary, style]}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
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
