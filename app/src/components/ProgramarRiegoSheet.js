import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from './PressableScale';
import { PrimaryButton } from './Buttons';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { programarRiegoAPI } from '../services/api';
import { DISPOSITIVO_ID } from '../constants/device';

// Modal de "Programar riego" (Paso 7, se abre desde el detalle de una
// planta). Chrome (header, botón, tipografía) con la estética SUWA de
// siempre; el selector de hora en sí usa el picker nativo del sistema
// (@react-native-community/datetimepicker) -- construir una rueda de
// hora propia desde cero es mucho trabajo para algo que el picker
// nativo ya resuelve bien y de forma accesible.
export default function ProgramarRiegoSheet({
  visible,
  onClose,
  nombrePlanta,
  programacionActual,
  onGuardado,
}) {
  const insets = useSafeAreaInsets();
  const [hora, setHora] = useState(new Date());
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!visible || !programacionActual) return;
    const fecha = new Date();
    fecha.setHours(programacionActual.hora, programacionActual.minuto, 0, 0);
    setHora(fecha);
  }, [visible, programacionActual]);

  if (!visible) return null;

  const handleGuardar = async () => {
    const horaTexto = hora.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const ahora = new Date();
    const proxima = new Date(ahora);
    proxima.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
    if (proxima <= ahora) proxima.setDate(proxima.getDate() + 1);

    setGuardando(true);
    try {
      await programarRiegoAPI({
        dispositivoId: DISPOSITIVO_ID,
        hora: hora.getHours(),
        minuto: hora.getMinutes(),
        proximaEjecucion: proxima.toISOString(),
      });
      onGuardado?.({ hora: hora.getHours(), minuto: hora.getMinutes() });
      onClose();
      Alert.alert('Riego programado', `${nombrePlanta} se regará todos los días a las ${horaTexto}.`);
    } catch (error) {
      Alert.alert(
        'No se pudo programar el riego',
        error.code === 'BACKEND_LOCAL_NO_DISPONIBLE'
          ? 'No se pudo comunicar con el backend local que consulta la placa.'
          : 'Intenta nuevamente en unos momentos.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.header}>
          <PressableScale onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={moderateScale(24)} color={colors.textDark} />
          </PressableScale>
          <Text style={styles.headerTitle}>Programar riego</Text>
          <View style={{ width: moderateScale(24) }} />
        </View>

        <Text style={styles.description}>
          Elegí a qué hora querés que {nombrePlanta} se riegue automáticamente todos los días.
        </Text>

        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={hora}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (selectedDate) setHora(selectedDate);
            }}
          />
        </View>

        <PrimaryButton
          label={guardando ? 'Guardando...' : 'Guardar'}
          onPress={handleGuardar}
          disabled={guardando}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: moderateScale(18),
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  pickerWrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  saveButton: {},
});
