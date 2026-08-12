import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from './PressableScale';
import { PrimaryButton } from './Buttons';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Modal de "Programar riego" (Paso 7, se abre desde el detalle de una
// planta). Chrome (header, botón, tipografía) con la estética SUWA de
// siempre; el selector de hora en sí usa el picker nativo del sistema
// (@react-native-community/datetimepicker) -- construir una rueda de
// hora propia desde cero es mucho trabajo para algo que el picker
// nativo ya resuelve bien y de forma accesible.
export default function ProgramarRiegoSheet({ visible, onClose, nombrePlanta }) {
  const insets = useSafeAreaInsets();
  const [hora, setHora] = useState(new Date());

  if (!visible) return null;

  const handleGuardar = () => {
    // Mock -- todavía no hay endpoint para programar riegos (no está en
    // el contrato de API original). Cuando exista, acá se manda `hora`
    // al backend en vez de solo mostrar la confirmación.
    const horaTexto = hora.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    onClose();
    Alert.alert('Riego programado', `${nombrePlanta} se va a regar todos los días a las ${horaTexto}.`);
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

        <PrimaryButton label="Guardar" onPress={handleGuardar} style={styles.saveButton} />
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
