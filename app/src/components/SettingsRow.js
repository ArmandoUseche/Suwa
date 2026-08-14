import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import PressableScale from './PressableScale';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Fila reusada en Perfil (Gmail/Usuario/Nombre/Cambiar contraseña/
// Cerrar sesión) y Configuración (Notificación/Terms of use/etc).
// `value`: texto a la derecha en verde (Gmail/Usuario/Nombre del
// mockup). `subtitle`: texto chico debajo del label (el correo debajo
// de "Cerrar sesión" en el mockup). `onPress`: si no viene, la fila no
// es tocable y no muestra chevron -- así sirve tanto para filas
// informativas como para las que navegan a otro lado.
export default function SettingsRow({ label, value, subtitle, onPress, danger }) {
  const content = (
    <View style={styles.row}>
      <View style={styles.textColumn}>
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {value && <Text style={styles.value}>{value}</Text>}
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={moderateScale(18)}
          color={colors.textMuted}
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <PressableScale onPress={onPress} outerStyle={styles.pressable}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  textColumn: {
    flex: 1,
  },
  label: {
    ...typography.body,
    fontSize: moderateScale(14),
  },
  labelDanger: {
    color: colors.danger,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  value: {
    ...typography.body,
    fontSize: moderateScale(13),
    color: colors.primary,
    marginRight: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});
