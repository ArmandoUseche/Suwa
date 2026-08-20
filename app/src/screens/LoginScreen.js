import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GradientBackground from '../components/GradientBackground';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { colors, spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';

function getFormErrors(form) {
  const errors = {};
  if (!form.correo.trim()) errors.correo = 'Ingresa tu correo electrónico';
  if (!form.contrasena) errors.contrasena = 'Ingresa tu contraseña';
  return errors;
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [errorMessage, setErrorMessage] = useState(null);
  const [cargando, setCargando] = useState(false);

  const updateField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const errors = getFormErrors(form);
    const firstError = Object.values(errors)[0];

    if (firstError) {
      setErrorMessage(firstError);
      return;
    }

    setErrorMessage(null);
    setCargando(true);

    try {
      await login(form.correo, form.contrasena);
      navigation.replace('Main');
    } catch (error) {
      const mensaje =
        error.response?.data?.error || 'Error al iniciar sesión. Intenta de nuevo.';
      setErrorMessage(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>¡Hola de nuevo!</Text>
          <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

          <FormTextInput
            label="Correo electrónico"
            value={form.correo}
            onChangeText={updateField('correo')}
            keyboardType="email-address"
          />
          <FormTextInput
            label="Contraseña"
            value={form.contrasena}
            onChangeText={updateField('contrasena')}
            isPassword
          />

          <Pressable style={styles.forgotPasswordRow}>
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <PrimaryButton
            label={cargando ? 'Ingresando...' : 'Iniciar sesión'}
            onPress={handleSubmit}
            disabled={cargando}
            style={styles.submitButton}
          />

          <View style={styles.registerRow}>
            <Text style={typography.caption}>¿No tienes una cuenta? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: moderateScale(26),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  errorText: {
    color: colors.danger,
    fontSize: moderateScale(13),
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  registerLink: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primaryDark,
  },
});