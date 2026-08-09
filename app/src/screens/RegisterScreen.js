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
import { colors, radius, spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale } from '../utils/responsive';

// Reglas de validación del formulario de Registro. Las separamos de la
// pantalla para que sean fáciles de testear/ajustar sin tocar el JSX.
function getFormErrors(form) {
  const errors = {};

  if (!form.nombre.trim()) errors.nombre = 'Ingresa tu nombre';
  if (!form.apellidos.trim()) errors.apellidos = 'Ingresa tus apellidos';
  if (!form.correoOTelefono.trim()) {
    errors.correoOTelefono = 'Ingresa tu correo o teléfono';
  }
  if (form.contrasena.length < 6) {
    errors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
  }
  if (form.confirmarContrasena !== form.contrasena) {
    errors.confirmarContrasena = 'Las contraseñas no coinciden';
  }
  if (!form.aceptaTerminos) {
    errors.aceptaTerminos = 'Debes aceptar los Términos y la Política de Privacidad';
  }

  return errors;
}

// Formulario de Registro (mockup 6).
export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    correoOTelefono: '',
    contrasena: '',
    confirmarContrasena: '',
    aceptaTerminos: false,
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const updateField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const errors = getFormErrors(form);
    const firstError = Object.values(errors)[0];

    if (firstError) {
      setErrorMessage(firstError);
      return;
    }

    setErrorMessage(null);
    // TODO(backend): conectar con el endpoint real de registro de usuario
    // cuando esté disponible en el contrato de API.
    navigation.replace('RegisterSuccess');
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

          <Pressable
            style={styles.termsRow}
            onPress={() => updateField('aceptaTerminos')(!form.aceptaTerminos)}
          >
            <View
              style={[
                styles.checkbox,
                form.aceptaTerminos && styles.checkboxChecked,
              ]}
            >
              {form.aceptaTerminos && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Al hacer clic en "Registrarse", aceptas los Términos de
              Servicio y la Política de Privacidad de SUWA.
            </Text>
          </Pressable>

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <PrimaryButton
            label="Registrarse"
            onPress={handleSubmit}
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
    textAlign: 'left',
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm / 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  termsText: {
    ...typography.caption,
    flex: 1,
  },
  errorText: {
    color: colors.danger,
    fontSize: moderateScale(13),
    marginBottom: spacing.md,
  },
});
