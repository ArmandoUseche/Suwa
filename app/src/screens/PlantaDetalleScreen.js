import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HistorialChart from '../components/HistorialChart';
import ProgramarRiegoSheet from '../components/ProgramarRiegoSheet';
import PressableScale from '../components/PressableScale';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { icons } from '../constants/images';
import { DISPOSITIVO_ID } from '../constants/device';
import { useAppState } from '../context/AppStateContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import { activarRiegoAPI, getHistorialSensoresAPI } from '../services/api';

// Detalle de una planta (Paso 7, se llega desde "Ver monitoreo"/"Ver
// detalle" en la lista de Mis Plantas). Recibe `plantaId` por parámetro
// de navegación y busca la planta en `plantas` del AppStateContext
// compartido (ya no el mock directo) -- así, si desde acá se editan los
// umbrales, la lista de Mis Plantas ve el cambio también, sin recargar.
export default function PlantaDetalleScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { plantaId } = route.params ?? {};
  const { plantas, actualizarPlanta } = useAppState();
  const planta = plantas.find((p) => p.id === plantaId) ?? plantas[0];
  const [showProgramarRiego, setShowProgramarRiego] = useState(false);
  const [guardandoFoto, setGuardandoFoto] = useState(false);
  const [activandoMonitoreo, setActivandoMonitoreo] = useState(false);
  const [regando, setRegando] = useState(false);
  const [lecturas, setLecturas] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Resguardo: esta pantalla solo debería alcanzarse con al menos una
  // planta ya cargada (se llega desde un item de la lista de Mis
  // Plantas), pero si `plantas` llegara vacío igual (ej. navegación
  // directa, o se vacía el array a mano para probar el estado vacío
  // mientras esta pantalla ya estaba abierta), `planta` sería
  // `undefined` y todo lo de abajo (`planta.nombreComun`, etc.)
  // tiraría error en vez de mostrar una pantalla en blanco.
  useEffect(() => {
    if (!planta?.enMonitoreo) {
      setLecturas([]);
      return undefined;
    }
    let activo = true;
    setCargandoHistorial(true);
    getHistorialSensoresAPI(DISPOSITIVO_ID)
      .then((res) => {
        if (activo) setLecturas(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (activo) setLecturas([]);
      })
      .finally(() => {
        if (activo) setCargandoHistorial(false);
      });
    return () => {
      activo = false;
    };
  }, [planta?.enMonitoreo]);

  const historial24h = agruparLecturas24h(lecturas);

  if (!planta) {
    return (
      <View style={styles.emptyGuard}>
        <Text style={typography.body}>No se encontró esta planta.</Text>
        <PrimaryButton label="Volver" onPress={() => navigation.goBack()} style={styles.emptyGuardButton} />
      </View>
    );
  }

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar la foto de la planta.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (resultado.canceled || !resultado.assets?.[0]?.uri) return;

    setGuardandoFoto(true);
    try {
      await actualizarPlanta(planta.id, { fotoUri: resultado.assets[0].uri });
      Alert.alert('Foto actualizada', 'La foto principal de la planta fue guardada.');
    } catch (error) {
      Alert.alert('No se pudo guardar la foto', 'Intenta nuevamente.');
    } finally {
      setGuardandoFoto(false);
    }
  };

  const ponerEnMonitoreo = async () => {
    setActivandoMonitoreo(true);
    try {
      await actualizarPlanta(planta.id, {
        dispositivoId: planta.dispositivoId,
        enMonitoreo: true,
      });
      Alert.alert('Planta principal actualizada', `${planta.nombreComun} ahora está en monitoreo.`);
    } catch (error) {
      Alert.alert('No se pudo cambiar la planta principal', 'Intenta nuevamente.');
    } finally {
      setActivandoMonitoreo(false);
    }
  };

  const handleRegarAhora = async () => {
    if (regando) return;
    setRegando(true);
    try {
      await activarRiegoAPI(DISPOSITIVO_ID, 10);
      Alert.alert('Riego activado', `La orden de riego de ${planta.nombreComun} se envió al kit.`);
    } catch (error) {
      Alert.alert(
        'No se pudo activar el riego',
        'Revisa que el kit esté conectado e inténtalo de nuevo.'
      );
    } finally {
      setRegando(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <PressableScale onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={moderateScale(26)} color={colors.textDark} />
          </PressableScale>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {planta.nombreComun}
          </Text>
          <View style={{ width: moderateScale(26) }} />
        </View>

        <View style={styles.fotoContainer}>
          <Image source={planta.foto} style={styles.foto} resizeMode="cover" />
          <SecondaryButton
            label={guardandoFoto ? 'Guardando foto...' : 'Tomar foto principal'}
            onPress={tomarFoto}
            disabled={guardandoFoto}
            style={styles.fotoButton}
          />
        </View>

        {planta.enMonitoreo ? (
          <>
            <View style={styles.historySection}>
              <View style={styles.historyHeaderRow}>
                <Text style={styles.historyTitle}>History</Text>
                <Text style={styles.historySubtitle}>Último 24h</Text>
              </View>
              {cargandoHistorial ? (
                <ActivityIndicator color={colors.primary} />
              ) : historial24h.length > 0 ? (
                <HistorialChart
                  labels={historial24h.map((item) => item.label)}
                  series={[{
                    label: 'Humedad',
                    unit: '%',
                    color: colors.primary,
                    values: historial24h.map((item) => item.humedadSuelo),
                  }]}
                />
              ) : (
                <Text style={styles.sinHistorial}>Aún no hay lecturas de las últimas 24 horas.</Text>
              )}
              <Text style={styles.luzText}>Luz: {planta.luzIdeal}</Text>
            </View>

            <View style={styles.actionsRow}>
              <PrimaryButton
                label={regando ? 'Regando...' : 'Regar ahora'}
                icon="water"
                onPress={handleRegarAhora}
                disabled={regando}
                style={styles.actionButton}
              />
              <SecondaryButton
                label="Programar riego"
                onPress={() => setShowProgramarRiego(true)}
                style={styles.actionButton}
              />
            </View>

            <View style={styles.humedadBlock}>
              <Text style={styles.humedadLabel}>
                Humedad: <Text style={styles.humedadValor}>{planta.humedadActual}%</Text>
              </Text>
              <Text style={styles.humedadEstado}>({planta.humedadEstado})</Text>
            </View>

            <View style={styles.kitRow}>
              <Image source={icons.estadoSenal} style={styles.kitIcon} resizeMode="contain" />
              <View>
                <Text style={styles.kitTitle}>Kit SUWA</Text>
                <Text style={styles.kitStatus}>
                  {planta.kitConexion === 'estable' ? 'Conexión estable' : 'Conexión inestable'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.sinMonitoreoBlock}>
            <Text style={styles.sinMonitoreoText}>
              Esta planta no está conectada al kit ahora mismo, así que
              no hay datos en vivo para mostrar. Conectá el kit a esta
              planta desde Monitoreo para empezar a verla acá.
            </Text>
            <Text style={styles.luzText}>Luz ideal: {planta.luzIdeal}</Text>
            <PrimaryButton
              label={activandoMonitoreo ? 'Actualizando...' : 'Poner en monitoreo'}
              onPress={ponerEnMonitoreo}
              disabled={activandoMonitoreo}
              style={styles.monitoreoButton}
            />
          </View>
        )}

        {/* Centro de alertas / umbrales -- placeholder por ahora
            (Paso 8), la configuración real todavía no está construida. */}
        <View style={styles.configSection}>
          <PressableScale
            onPress={() => Alert.alert('Centro de alertas', 'Se conecta más adelante.')}
            style={styles.configRow}
          >
            <Ionicons name="notifications-outline" size={moderateScale(20)} color={colors.textDark} />
            <Text style={styles.configLabel}>Centro de alertas</Text>
            <Ionicons name="chevron-forward" size={moderateScale(18)} color={colors.textMuted} />
          </PressableScale>
          <PressableScale
            onPress={() =>
              navigation.navigate('ConfigurarUmbrales', { plantaId: planta.id })
            }
            style={styles.configRow}
          >
            <Ionicons name="options-outline" size={moderateScale(20)} color={colors.textDark} />
            <Text style={styles.configLabel}>Configurar umbrales de riego</Text>
            <Ionicons name="chevron-forward" size={moderateScale(18)} color={colors.textMuted} />
          </PressableScale>
        </View>
      </ScrollView>

      <ProgramarRiegoSheet
        visible={showProgramarRiego}
        onClose={() => setShowProgramarRiego(false)}
        nombrePlanta={planta.nombreComun}
      />
    </View>
  );
}

function agruparLecturas24h(lecturas) {
  const limite = Date.now() - 24 * 60 * 60 * 1000;
  const grupos = new Map();
  lecturas
    .filter((lectura) => new Date(lectura.timestamp).getTime() >= limite)
    .forEach((lectura) => {
      const timestamp = new Date(lectura.timestamp).getTime();
      if (!Number.isFinite(timestamp)) return;
      const clave = Math.floor(timestamp / (60 * 60 * 1000));
      const grupo = grupos.get(clave) || [];
      grupo.push(lectura);
      grupos.set(clave, grupo);
    });

  return [...grupos.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, grupo]) => ({
      label: `${String(new Date(grupo[0].timestamp).getHours()).padStart(2, '0')}h`,
      humedadSuelo: Math.round(
        grupo.reduce((total, lectura) => total + Number(lectura.humedadSuelo || 0), 0) / grupo.length
      ),
    }));
}

const styles = StyleSheet.create({
  emptyGuard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyGuardButton: {
    minWidth: moderateScale(160),
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  topBarTitle: {
    ...typography.h2,
    fontSize: moderateScale(18),
    flex: 1,
    textAlign: 'center',
  },
  foto: {
    width: '100%',
    height: moderateScale(280),
  },
  fotoContainer: {
    alignItems: 'center',
  },
  fotoButton: {
    marginTop: spacing.md,
    minWidth: moderateScale(190),
  },
  historySection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    ...typography.h2,
    fontSize: moderateScale(17),
  },
  historySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sinHistorial: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  luzText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  humedadBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  humedadLabel: {
    ...typography.body,
    color: colors.textDark,
  },
  humedadValor: {
    fontFamily: 'Inter_600SemiBold',
  },
  humedadEstado: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  kitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  kitIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
  },
  kitTitle: {
    ...typography.body,
    fontFamily: 'Inter_500Medium',
    fontSize: moderateScale(14),
  },
  kitStatus: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  sinMonitoreoBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  monitoreoButton: {
    marginTop: spacing.lg,
  },
  sinMonitoreoText: {
    ...typography.body,
    color: colors.textMuted,
  },
  configSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  configLabel: {
    ...typography.body,
    fontSize: moderateScale(14),
    flex: 1,
  },
});
