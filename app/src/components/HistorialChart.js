import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale, screen } from '../utils/responsive';

// Convierte un color hex (#RRGGBB) a "r, g, b" para armar el
// rgba(...) que pide react-native-chart-kit en su prop `color`.
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

const CHART_WIDTH = screen.width - 48; // 48 = padding horizontal de la pantalla (spacing.lg * 2)
const CHART_HEIGHT = 180;

// Gráfica de línea de Historial. Recibe `series`: un array de 1 o 2
// líneas ya resueltas ({ label, values, color, unit }) -- no sabe nada
// del modelo de sensores, solo dibuja lo que le llega. Con 1 serie
// (Humedad) no muestra leyenda; con 2 (Temperatura + humedad ambiente,
// que van juntas por ser "la temperatura relativa") sí, para poder
// distinguir cuál línea es cuál.
export default function HistorialChart({ labels, series }) {
  // react-native-chart-kit pide el color de CADA dataset como una
  // función (opacity) => rgba(...), no como un string fijo.
  const datasets = series.map((s) => ({
    data: s.values,
    color: (opacity = 1) => `rgba(${hexToRgb(s.color)}, ${opacity})`,
    strokeWidth: 2,
  }));

  return (
    <View>
      <View style={styles.wrapper}>
        <LineChart
          data={{ labels, datasets }}
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          withInnerLines={false}
          withOuterLines={false}
          withShadow={false}
          bezier
          chartConfig={{
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(${hexToRgb(colors.textMuted)}, ${opacity})`,
            labelColor: () => colors.textMuted,
            propsForDots: { r: '3', strokeWidth: '2' },
          }}
          style={styles.chart}
        />
      </View>

      {series.length > 1 && (
        <View style={styles.legend}>
          {series.map((s) => (
            <View key={s.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: s.color }]} />
              <Text style={styles.legendLabel}>
                {s.label} ({s.unit})
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: radius.md,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  legendLabel: {
    ...typography.caption,
    fontSize: moderateScale(11),
  },
});
