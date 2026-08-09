import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { colors, radius } from '../constants/theme';
import { screen } from '../utils/responsive';

// Convierte un color hex (#RRGGBB) a "r, g, b" para armar el
// rgba(...) que pide react-native-chart-kit en su prop `color`.
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

const CHART_WIDTH = screen.width - 48; // 48 = padding horizontal de la pantalla (spacing.lg * 2)
const CHART_HEIGHT = 180;

// Gráfica de línea de un sensor a lo largo de la semana. Recibe ya los
// datos resueltos (labels + values) en vez de saber nada del modelo de
// sensores -- así HistorialScreen decide qué sensor mostrar (según
// SensorTypeTabs) y este componente solo dibuja.
export default function HistorialChart({ labels, values, lineColor }) {
  const rgb = hexToRgb(lineColor);

  return (
    <View style={styles.wrapper}>
      <LineChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
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
          color: (opacity = 1) => `rgba(${rgb}, ${opacity})`,
          labelColor: () => colors.textMuted,
          propsForDots: {
            r: '3',
            strokeWidth: '2',
            stroke: lineColor,
          },
        }}
        style={styles.chart}
      />
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
});
