import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SolidHeaderBar from '../components/SolidHeaderBar';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const OPCIONES_INICIALES = [
  { key: 'riego', label: 'Alertas de riego', descripcion: 'Cuando el kit riegue automáticamente.' },
  { key: 'humedad', label: 'Humedad baja', descripcion: 'Cuando el suelo esté por debajo del umbral.' },
  { key: 'sistema', label: 'Alertas del sistema', descripcion: 'Fallas del kit o pérdida de conexión.' },
];
const VALORES_POR_DEFECTO = { riego: true, humedad: true, sistema: true };
const CLAVE_PREFERENCIAS = 'preferencias-notificaciones';

export default function NotificacionesScreen({ navigation }) {
  const { usuario } = useAuth();
  const [valores, setValores] = useState(VALORES_POR_DEFECTO);
  const preferenciasCargadas = useRef(false);
  const usuarioId = usuario?._id || usuario?.id || usuario?.correoOTelefono || 'anonimo';
  const claveUsuario = `${CLAVE_PREFERENCIAS}:${usuarioId}`;

  useEffect(() => {
    let activo = true;
    preferenciasCargadas.current = false;

    const cargarPreferencias = async () => {
      try {
        const guardadas = await AsyncStorage.getItem(claveUsuario);
        if (!activo) return;
        if (!guardadas) {
          setValores(VALORES_POR_DEFECTO);
        } else {
          const preferencias = JSON.parse(guardadas);
          setValores({
            ...VALORES_POR_DEFECTO,
            ...Object.fromEntries(
              Object.keys(VALORES_POR_DEFECTO)
                .filter((key) => typeof preferencias?.[key] === 'boolean')
                .map((key) => [key, preferencias[key]])
            ),
          });
        }
      } catch (error) {
        console.warn('Error cargando preferencias de notificaciones:', error.message);
        if (activo) setValores(VALORES_POR_DEFECTO);
      } finally {
        if (activo) preferenciasCargadas.current = true;
      }
    };

    cargarPreferencias();
    return () => {
      activo = false;
    };
  }, [claveUsuario]);

  useEffect(() => {
    if (!preferenciasCargadas.current) return;
    AsyncStorage.setItem(claveUsuario, JSON.stringify(valores)).catch((error) => {
      console.warn('Error guardando preferencias de notificaciones:', error.message);
    });
  }, [claveUsuario, valores]);

  const toggle = (key) => {
    setValores((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Notificaciones" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {OPCIONES_INICIALES.map((opcion, i) => (
            <View key={opcion.key}>
              <View style={styles.row}>
                <View style={styles.textColumn}>
                  <Text style={styles.label}>{opcion.label}</Text>
                  <Text style={styles.descripcion}>{opcion.descripcion}</Text>
                </View>
                <Switch
                  value={valores[opcion.key]}
                  onValueChange={() => toggle(opcion.key)}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {i < OPCIONES_INICIALES.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  textColumn: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    ...typography.body,
    fontSize: moderateScale(14),
    fontFamily: 'Inter_500Medium',
  },
  descripcion: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
