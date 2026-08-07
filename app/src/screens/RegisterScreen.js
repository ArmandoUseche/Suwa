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

// Formulario de Registro (mockup 6). Por ahora solo maneja el estado
// de los campos en pantalla; la validación y el submit real se agregan
// en el siguiente commit.
export default function RegisterScreen() {
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    correoOTelefono: '',
    contrasena: '',
    confirmarContrasena: '',
  });

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
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Crea tu cuenta en SUWA</Text>

          <FormTextInput
            label="Nombre"
            value={form.nombre}
            onChangeText={updateField('nombre')}
          />
          <FormTextInput
            label="Apellidos"
            value={form.apellidos}
            onChangeText={updateField('apellidos')}
          />
          <FormTextInput
            label="Correo electrónico o teléfono"
            value={form.correoOTelefono}
            onChangeText={updateField('correoOTelefono')}
            keyboardType="email-address"
          />
          <FormTextInput
            label="Contraseña"
            value={form.contrasena}
            onChangeText={updateField('contrasena')}
            isPassword
          />
          <FormTextInput
            label="Confirmar contraseña"
            value={form.confirmarContrasena}
            onChangeText={updateField('confirmarContrasena')}
            isPassword
          />

          <PrimaryButton
            label="Registrarse"
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
    textAlign: 'left',
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
