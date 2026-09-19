import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SolidHeaderBar from '../components/SolidHeaderBar';
import { PrimaryButton } from '../components/Buttons';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../constants/theme';

export default function EditarPerfilScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { usuario, actualizarPerfil } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos || '');
  const [correoOTelefono, setCorreoOTelefono] = useState(usuario?.correoOTelefono || '');
  const [nombreUsuario, setNombreUsuario] = useState(usuario?.usuario || usuario?.correoOTelefono?.split('@')[0] || '');
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim() || !apellidos.trim() || !correoOTelefono.trim() || !nombreUsuario.trim()) {
      Alert.alert('Datos incompletos', 'Completa todos los campos para guardar el perfil.');
      return;
    }
    setGuardando(true);
    try {
      await actualizarPerfil({
        nombre,
        apellidos,
        correoOTelefono,
        usuario: nombreUsuario,
      });
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('No se pudo actualizar', error.response?.data?.error || 'Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SolidHeaderBar title="Editar perfil" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Campo label="Nombre" value={nombre} onChangeText={setNombre} />
        <Campo label="Apellidos" value={apellidos} onChangeText={setApellidos} />
        <Campo label="Usuario" value={nombreUsuario} onChangeText={setNombreUsuario} autoCapitalize="none" />
        <Campo label="Correo o teléfono" value={correoOTelefono} onChangeText={setCorreoOTelefono} autoCapitalize="none" />
        <PrimaryButton label={guardando ? 'Guardando...' : 'Guardar cambios'} onPress={guardar} disabled={guardando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textDark, marginBottom: spacing.xs },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textDark,
  },
});
