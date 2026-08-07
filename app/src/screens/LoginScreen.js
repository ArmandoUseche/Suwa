import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import GradientBackground from '../components/GradientBackground';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { spacing, typography } from '../constants/theme';

// Formulario de Login (mockup 9). Por ahora solo maneja el estado de los
// campos; la validación y el submit real van en el siguiente commit.
export default function LoginScreen() {
  const [form, setForm] = useState({ correo: '', contrasena: '' });

  const updateField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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

          <PrimaryButton
            label="Iniciar sesión"
            onPress={() => {}}
            style={styles.submitButton}
          />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
