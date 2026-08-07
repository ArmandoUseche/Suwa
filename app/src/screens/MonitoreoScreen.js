import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import GradientBackground from '../components/GradientBackground';
import SensorCard from '../components/SensorCard';
import { icons } from '../constants/images';
import { mockAlertasNoLeidas, mockUltimaLectura } from '../constants/mockData';
import { colors, spacing, typography } from '../constants/theme';
import { formatearTiempoRelativo } from '../utils/formatters';
import { contentMaxWidth, moderateScale } from '../utils/responsive';

// Pantalla de Monitoreo (Paso 5): dashboard con la última lectura de
// sensores. Por ahora usa datos mock (mockUltimaLectura); conectar con
// GET /api/sensores/:dispositivoId/ultima y el evento de socket
// `nueva_lectura` queda para cuando el backend esté listo, sin tener que
// tocar el layout de acá.
//
// El centro de alertas va como ícono de notificación en este header (así
// se decidió, ya que el mockup de Figma no traía una pantalla para eso).
export default function MonitoreoScreen() {
  const lectura = mockUltimaLectura;

  return (
    <GradientBackground style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Monitoreo</Text>
            <Text style={styles.subtitle}>
              Actualizado {formatearTiempoRelativo(lectura.timestamp)}
            </Text>
          </View>

          <Pressable
            style={styles.bellButton}
            hitSlop={10}
            // TODO(paso 8): navegar al centro de alertas cuando exista
            // la pantalla; por ahora el ícono ya refleja no leídas.
            onPress={() => {}}
          >
            <Image source={icons.notificacion} style={styles.bellIcon} resizeMode="contain" />
            {mockAlertasNoLeidas > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{mockAlertasNoLeidas}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.cardsGrid}>
          <SensorCard
            icon={icons.gotaAgua}
            label="Humedad del suelo"
            value={lectura.humedadSuelo}
            unit="%"
            accentColor={colors.primary}
          />
          <SensorCard
            icon={icons.temperaturaAlta}
            label="Temperatura"
            value={lectura.temperatura}
            unit="°C"
            accentColor={colors.warning}
          />
          <SensorCard
            icon={icons.gotaAgua}
            label="Humedad ambiente"
            value={lectura.humedadAmbiente}
            unit="%"
            accentColor={colors.primaryLight}
          />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    fontSize: moderateScale(24),
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  bellButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    tintColor: colors.headerGreen,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
