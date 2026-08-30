import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GradientBackground from '../components/GradientBackground';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import PressableScale from '../components/PressableScale';
import { colors, spacing, typography } from '../constants/theme';
import { contentMaxWidth, moderateScale } from '../utils/responsive';
import { olvideContrasenaAPI } from '../services/api';

export default function OlvideContrasenaScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleEnviar = async () => {
    if (!correo.trim()) {
      setErrorMessage('Ingresa tu correo electrónico');
      return;
    }

    setErrorMessage(null);
    setCargando(true);

    try {
      await olvideContrasenaAPI(correo.trim());
      navigation.navigate('VerificarCodigo', { correo: correo.trim() });
    } catch (error) {
      const mensaje =
        error.response?.data?.error || 'Error al enviar el código. Intenta de nuevo.';
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
          <Text style={styles.title}>¿Olvidaste tu{'\n'}contraseña?</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un código para
            restablecer tu contraseña.
          </Text>

          <FormTextInput
            label="Correo electrónico"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
          />

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <PrimaryButton
            label={cargando ? 'Enviando...' : 'Enviar código'}
            onPress={handleEnviar}
            disabled={cargando}
            style={styles.button}
          />

          <View style={styles.backRow}>
            <PressableScale onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Volver al inicio de sesión</Text>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    fontSize: moderateScale(13),
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  backRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backText: {
    ...typography.caption,
    color: colors.primaryDark,
  },
});