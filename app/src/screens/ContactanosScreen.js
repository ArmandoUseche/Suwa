import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SolidHeaderBar from '../components/SolidHeaderBar';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Contáctanos (Paso 8). Sin mockup -- datos de contacto + un mensaje
// corto opcional, mismo lenguaje visual que el resto. El envío es mock
// (no hay endpoint de contacto en el contrato de API).
export default function ContactanosScreen({ navigation }) {
  const [mensaje, setMensaje] = useState('');

  const handleEnviar = () => {
    if (!mensaje.trim()) {
      Alert.alert('Escribí algo', 'Contanos qué necesitás antes de enviar.');
      return;
    }
    Alert.alert('¡Gracias!', 'Recibimos tu mensaje, te vamos a responder pronto.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Contáctanos" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={moderateScale(20)} color={colors.primary} />
            <Text style={styles.infoText}>soporte@suwa.app</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="logo-instagram" size={moderateScale(20)} color={colors.primary} />
            <Text style={styles.infoText}>@suwa.app</Text>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Escribinos tu consulta</Text>
        <FormTextInput
          label="Contanos qué necesitás..."
          value={mensaje}
          onChangeText={setMensaje}
          multiline
          numberOfLines={5}
          style={styles.textarea}
        />

        <PrimaryButton label="Enviar mensaje" onPress={handleEnviar} style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  infoText: {
    ...typography.body,
    fontSize: moderateScale(14),
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  fieldLabel: {
    ...typography.body,
    fontFamily: 'Inter_500Medium',
    fontSize: moderateScale(14),
    marginBottom: spacing.xs,
  },
  textarea: {
    marginBottom: spacing.lg,
  },
  button: {},
});
