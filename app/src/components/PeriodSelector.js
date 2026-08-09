import { StyleSheet, Text, View } from 'react-native';

import PressableScale from './PressableScale';
import { colors, radius, spacing, typography } from '../constants/theme';

const OPTIONS = ['Día', 'Semana', 'Año'];

// Fila de 3 pastillas (mockup de Historial): la seleccionada queda
// rellena en verde, las otras 2 con solo borde. Controlado desde afuera
// (value/onChange) en vez de manejar su propio estado, para que la
// pantalla que lo use decida qué pasa al cambiar de período (por ahora
// no hace nada real -- son datos mock -- pero ya queda listo el gancho
// para cuando se conecte a pedir el historial por rango real).
export default function PeriodSelector({ value, onChange }) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const active = option === value;
        return (
          <PressableScale
            key={option}
            onPress={() => onChange(option)}
            outerStyle={styles.pillOuter}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pillOuter: {
    flex: 1,
  },
  pill: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.caption,
    fontFamily: 'Inter_500Medium',
    color: colors.textDark,
  },
  labelActive: {
    color: colors.textOnPrimary,
  },
});
