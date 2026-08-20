import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import SolidHeaderBar from '../components/SolidHeaderBar';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { colors, spacing } from '../constants/theme';
import { cambiarContrasenaAPI } from '../services/api';

export default function CambiarContrasenaScreen({ navigation }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleConfirmar = async () => {
    if (!actual || !nueva || !confirmar) {
      Alert.alert('Faltan datos', 'Completá los 3 campos para continuar.');
      return;
    }
    if (nueva !== confirmar) {
      Alert.alert('No coinciden', 'La nueva contraseña y su confirmación no son iguales.');
      return;
    }
    if (nueva.length < 6) {
      Alert.alert('Contraseña muy corta', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await cambiarContrasenaAPI({ contrasenaActual: actual, contrasenaNueva: nueva });
      Alert.alert('Listo', 'Tu contraseña se actualizó correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al cambiar la contraseña.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Cambiar contraseña" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FormTextInput
          label="Contraseña actual"
          isPassword
          value={actual}
          onChangeText={setActual}
          style={styles.input}
        />
        <FormTextInput
          label="Nueva contraseña"
          isPassword
          value={nueva}
          onChangeText={setNueva}
          style={styles.input}
        />
        <FormTextInput
          label="Confirmar nueva contraseña"
          isPassword
          value={confirmar}
          onChangeText={setConfirmar}
          style={styles.input}
        />

        <PrimaryButton
          label={cargando ? 'Actualizando...' : 'Confirmar'}
          onPress={handleConfirmar}
          disabled={cargando}
          style={styles.button}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});