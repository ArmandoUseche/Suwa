import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Input de texto usado en Registro y Login. Soporta un ícono de "ojo"
// a la derecha para mostrar/ocultar contraseña, porque así está en el
// mockup de Login.
//
// Antes era un rectángulo plano sin borde ni sombra (se sentía "sin
// vida"). Ahora tiene un borde sutil y una sombra chica siempre, y al
// enfocar el campo el borde cambia a verde y la sombra se nota un poco
// más — feedback visual de que el campo está activo.
export default function FormTextInput({
  label,
  isPassword = false,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.wrapper,
        isFocused && styles.wrapperFocused,
        style,
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={isPassword && !isPasswordVisible}
        autoCapitalize="none"
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...textInputProps}
      />
      {isPassword && (
        <Pressable
          onPress={() => setIsPasswordVisible((prev) => !prev)}
          hitSlop={10}
          style={styles.eyeButton}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={moderateScale(20)}
            color={colors.textMuted}
          />
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
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#0E7A40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  wrapperFocused: {
    borderColor: colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
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
});
