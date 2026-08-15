import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { useAppState } from '../context/AppStateContext';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Vincular dispositivo (Paso 7, se llega desde el botón "Vincular
// dispositivo" en Monitoreo/Historial/Escanear/Mis Plantas). Código
// manual (el que viene impreso en la etiqueta del kit) -- se evaluaron
// otras opciones (QR, descubrimiento automático por WiFi/mDNS) pero
// las 2 necesitan cosas que no existen todavía: un QR impreso por
// dispositivo, o código nativo que no viene en Expo Go. El manual no
// depende de ninguna de las 2, y es un cambio chico pasar a QR más
// adelante si hace falta (mismo botón, cambia de dónde sale el código).
//
// No hay endpoint de "vincular dispositivo" en el contrato de API
// original (ver puntos-abiertos-backend.md) -- por ahora esto simula la
// conexión con un timer y después llama a vincularDispositivo() del
// AppStateContext, que sí es estado real de la app (no hay que recargar
// para ver el cambio reflejado en el resto de las pantallas).
export default function VincularDispositivoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { vincularDispositivo } = useAppState();
  const [codigo, setCodigo] = useState('');
  const [conectando, setConectando] = useState(false);

  const handleVincular = () => {
    if (!codigo.trim()) return;
    setConectando(true);
    // TODO(cuando exista el endpoint real): reemplazar este setTimeout
    // por la llamada real, por ejemplo POST /api/dispositivos/vincular
    // con { codigo }. Si falla (código inválido), acá se mostraría un
    // error en vez de llamar a vincularDispositivo().
    setTimeout(() => {
      vincularDispositivo();
      setConectando(false);
      navigation.goBack();
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={moderateScale(26)} color={colors.textDark} />
        </PressableScale>
        <Text style={styles.topBarTitle}>Vincular dispositivo</Text>
        <View style={{ width: moderateScale(26) }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="hardware-chip-outline" size={moderateScale(40)} color={colors.primary} />
        </View>

        <Text style={styles.title}>Vinculá tu kit SUWA</Text>
        <Text style={styles.description}>
          Ingresá el código que viene en la etiqueta pegada a tu kit
          (algo como SUWA-XXXX).
        </Text>

        <FormTextInput
          label="Código del kit"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
          style={styles.input}
        />

        {conectando ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Conectando...</Text>
          </View>
        ) : (
          <PrimaryButton
            label="Vincular"
            onPress={handleVincular}
            disabled={!codigo.trim()}
            style={styles.button}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  topBarTitle: {
    ...typography.h2,
    fontSize: moderateScale(17),
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  iconWrapper: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    fontSize: moderateScale(24),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },
  button: {
    alignSelf: 'stretch',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
