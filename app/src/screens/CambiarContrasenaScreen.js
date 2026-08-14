import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import SolidHeaderBar from '../components/SolidHeaderBar';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { colors, spacing } from '../constants/theme';

// Cambiar contraseña (Paso 8, se llega desde Perfil). El mockup tenía
// los 3 campos + botón pegados arriba; acá van centrados verticalmente
// en el espacio debajo del header, por pedido explícito.
//
// No hay pantalla de "recuperar contraseña" en el proyecto (ya se
// había decidido así) -- acá solo se cambia sabiendo la actual.
export default function CambiarContrasenaScreen({ navigation }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const handleConfirmar = () => {
    if (!actual || !nueva || !confirmar) {
      Alert.alert('Faltan datos', 'Completá los 3 campos para continuar.');
      return;
    }
    if (nueva !== confirmar) {
      Alert.alert('No coinciden', 'La nueva contraseña y su confirmación no son iguales.');
      return;
    }
    // Mock -- no hay endpoint de cambiar contraseña en el contrato de
    // API todavía. Cuando exista, acá se manda { actual, nueva } en vez
    // de solo mostrar la confirmación.
    Alert.alert('Listo', 'Tu contraseña se actualizó correctamente.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
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

        <PrimaryButton label="Confirmar" onPress={handleConfirmar} style={styles.button} />
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
