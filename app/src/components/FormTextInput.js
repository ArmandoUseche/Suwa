import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';

// Input de texto usado en Registro y Login. Soporta un ícono de "ojo"
// a la derecha para mostrar/ocultar contraseña, porque así está en el
// mockup de Login.
export default function FormTextInput({
  label,
  isPassword = false,
  style,
  ...textInputProps
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={isPassword && !isPasswordVisible}
        autoCapitalize="none"
        {...textInputProps}
      />
      {isPassword && (
        <Pressable
          onPress={() => setIsPasswordVisible((prev) => !prev)}
          hitSlop={10}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeIcon}>{isPasswordVisible ? '🙈' : '👁️'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textDark,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  eyeIcon: {
    fontSize: 18,
  },
});
