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
import { verificarCodigoAPI, olvideContrasenaAPI } from '../services/api';

export default function VerificarCodigoScreen({ navigation, route }) {
  const { correo } = route.params;
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reEnviando, setReEnviando] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleVerificar = async () => {
    if (codigo.length !== 6) {
      setErrorMessage('El código debe tener 6 dígitos');
      return;
    }

    setErrorMessage(null);
    setCargando(true);

    try {
      await verificarCodigoAPI(correo, codigo);
      navigation.navigate('NuevaContrasena', { correo, codigo });
    } catch (error) {
      const mensaje =
        error.response?.data?.error || 'Código incorrecto o expirado.';
      setErrorMessage(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const handleReenviar = async () => {
    setReEnviando(true);
    setErrorMessage(null);
    try {
      await olvideContrasenaAPI(correo);
      setErrorMessage('Código reenviado correctamente.');
    } catch {
      setErrorMessage('Error al reenviar el código.');
    } finally {
      setReEnviando(false);
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
          <Text style={styles.title}>Revisa tu correo</Text>
          <Text style={styles.subtitle}>
            Enviamos un código de 6 dígitos a{'\n'}
            <Text style={styles.correo}>{correo}</Text>
          </Text>

          <FormTextInput
            label="Código de verificación"
            value={codigo}
            onChangeText={setCodigo}
            keyboardType="number-pad"
            maxLength={6}
          />

          {errorMessage && (
            <Text style={[
              styles.errorText,
              errorMessage.includes('correctamente') && styles.successText,
            ]}>
              {errorMessage}
            </Text>
          )}

          <PrimaryButton
            label={cargando ? 'Verificando...' : 'Verificar código'}
            onPress={handleVerificar}
            disabled={cargando}
            style={styles.button}
          />

          <View style={styles.reenviarRow}>
            <Text style={styles.reenviarLabel}>¿No llegó el código? </Text>
            <PressableScale onPress={handleReenviar} disabled={reEnviando}>
              <Text style={styles.reenviarLink}>
                {reEnviando ? 'Enviando...' : 'Reenviar'}
              </Text>
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
  correo: {
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    color: colors.danger,
    fontSize: moderateScale(13),
    marginBottom: spacing.md,
  },
  successText: {
    color: colors.success,
  },
  button: {
    marginTop: spacing.sm,
  },
  reenviarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  reenviarLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  reenviarLink: {
    ...typography.caption,
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
});