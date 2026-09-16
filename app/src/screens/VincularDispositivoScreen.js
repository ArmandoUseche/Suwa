import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { useAppState } from '../context/AppStateContext';
import { crearPlantaAPI } from '../services/api';
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
// Ya conectada a datos reales: usa crearPlantaAPI directo (no
// agregarPlanta() del contexto, porque esa función no manda
// dispositivoId todavía) para crear una planta "placeholder" con el
// dispositivoId que el usuario escribió. Todavía no hay pantalla de
// "completar datos de la planta" en este flujo -- el nombre queda
// genérico y se puede editar después desde Mis Plantas/Configurar
// umbrales (ya existen esas pantallas). El backend no valida que el
// código corresponda a un kit real (no hay forma de eso sin que el
// firmware confirme conexión), así que cualquier texto no vacío
// "vincula" -- es una limitación conocida del alcance actual, igual
// que con el kit hardcodeado en Monitoreo/Historial.
export default function VincularDispositivoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { vincularDispositivo, cargarPlantas } = useAppState();
  const [codigo, setCodigo] = useState('');
  const [conectando, setConectando] = useState(false);

  const handleVincular = async () => {
    const dispositivoId = codigo.trim();
    if (!dispositivoId) return;

    setConectando(true);
    try {
      await crearPlantaAPI({
        nombreComun: 'Mi planta',
        nombreCientifico: 'Por identificar',
        dispositivoId,
      });
      await cargarPlantas();
      vincularDispositivo();
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'No se pudo vincular',
        'Revisa el código e inténtalo de nuevo. Si el problema sigue, confirma que el backend esté encendido.'
      );
    } finally {
      setConectando(false);
    }
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