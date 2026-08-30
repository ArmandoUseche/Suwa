import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import SolidHeaderBar from '../components/SolidHeaderBar';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { colors, spacing } from '../constants/theme';
import { nuevaContrasenaAPI } from '../services/api';

export default function NuevaContrasenaScreen({ navigation, route }) {
  const { correo, codigo } = route.params;
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleConfirmar = async () => {
    if (!nueva || !confirmar) {
      Alert.alert('Faltan datos', 'Completa los 2 campos para continuar.');
      return;
    }
    if (nueva !== confirmar) {
      Alert.alert('No coinciden', 'Las contraseñas no son iguales.');
      return;
    }
    if (nueva.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await nuevaContrasenaAPI(correo, codigo, nueva);
      Alert.alert(
        '¡Listo!',
        'Tu contraseña se actualizó correctamente. Inicia sesión con tu nueva contraseña.',
        [{ text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al actualizar la contraseña.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Nueva contraseña" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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