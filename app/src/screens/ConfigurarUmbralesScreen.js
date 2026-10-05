import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import FormTextInput from '../components/FormTextInput';
import { PrimaryButton } from '../components/Buttons';
import { useAppState } from '../context/AppStateContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

const OPCIONES_LUZ = ['Baja', 'Media', 'Alta'];

// Configurar umbrales de riego (Paso 7, se llega desde el detalle de
// una planta). Simple a propósito -- charlado con Joselin, sin mockup
// para esto, así que sigue el mismo lenguaje visual del resto en vez de
// inventar componentes nuevos (inputs de texto ya existentes +
// selector tipo chip como el de Historial).
//
// Además de las condiciones ambientales, esta pantalla configura la
// estrategia segura de riego por pulsos específica de cada planta.
export default function ConfigurarUmbralesScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { plantaId } = route.params ?? {};
  const { plantas, actualizarUmbrales } = useAppState();
  const planta = plantas.find((p) => p.id === plantaId) ?? plantas[0];

  // Los hooks tienen que llamarse siempre, así que el `?.` de acá evita
  // que truene ANTES de llegar al resguardo de abajo si `planta` viniera
  // undefined (plantas vacío) -- el resguardo en sí no puede ir antes de
  // estas líneas por la misma razón (reglas de hooks de React).
  const [humedad, setHumedad] = useState(String(planta?.umbralHumedadMinimo ?? 30));
  const [temperatura, setTemperatura] = useState(String(planta?.temperaturaIdeal ?? ''));
  const [luz, setLuz] = useState(planta?.luzIdeal ?? 'Media');
  const [pulso, setPulso] = useState(String(planta?.pulsoRiegoSegundos ?? 3));
  const [pausa, setPausa] = useState(String(planta?.pausaAbsorcionSegundos ?? 20));
  const [maxPulsos, setMaxPulsos] = useState(String(planta?.maxPulsosRiego ?? 3));
  const [tiempoMaximo, setTiempoMaximo] = useState(String(planta?.tiempoMaximoRiegoSegundos ?? 90));
  const [guardando, setGuardando] = useState(false);

  // Mismo resguardo que en PlantaDetalleScreen: esta pantalla solo
  // debería alcanzarse con una planta ya cargada, pero si `plantas`
  // llegara vacío, mejor esto que un error en blanco.
  if (!planta) {
    return (
      <View style={styles.emptyGuard}>
        <Text style={typography.body}>No se encontró esta planta.</Text>
        <PrimaryButton label="Volver" onPress={() => navigation.goBack()} style={styles.emptyGuardButton} />
      </View>
    );
  }

  const handleGuardar = async () => {
    const humedadNumero = Number(humedad);
    const temperaturaNumero = temperatura.trim() === '' ? null : Number(temperatura);

    if (!Number.isFinite(humedadNumero) || humedadNumero < 0 || humedadNumero > 100) {
      Alert.alert('Valor inválido', 'La humedad debe estar entre 0 y 100%.');
      return;
    }
    if (
      temperaturaNumero !== null
      && (!Number.isFinite(temperaturaNumero) || temperaturaNumero < -50 || temperaturaNumero > 80)
    ) {
      Alert.alert('Valor inválido', 'La temperatura debe estar entre -50 y 80 °C.');
      return;
    }
    const parametrosRiego = [
      ['pulso', pulso, 1, 10, 'El pulso debe estar entre 1 y 10 segundos.'],
      ['pausa', pausa, 10, 120, 'La pausa debe estar entre 10 y 120 segundos.'],
      ['maxPulsos', maxPulsos, 1, 10, 'Los pulsos deben estar entre 1 y 10.'],
      ['tiempoMaximo', tiempoMaximo, 1, 120, 'El tiempo máximo debe estar entre 1 y 120 segundos.'],
    ];
    for (const [, valor, minimo, maximo, mensaje] of parametrosRiego) {
      if (!Number.isInteger(Number(valor)) || Number(valor) < minimo || Number(valor) > maximo) {
        Alert.alert('Valor inválido', mensaje);
        return;
      }
    }

    setGuardando(true);
    try {
      await actualizarUmbrales(planta.id, {
        umbralHumedadMinimo: humedadNumero,
        temperaturaIdeal: temperaturaNumero,
        luzIdeal: luz,
        pulsoRiegoSegundos: Number(pulso),
        pausaAbsorcionSegundos: Number(pausa),
        maxPulsosRiego: Number(maxPulsos),
        tiempoMaximoRiegoSegundos: Number(tiempoMaximo),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'No se pudieron guardar los cambios',
        error.response?.data?.error || 'Verifica la conexión e inténtalo nuevamente.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={moderateScale(26)} color={colors.textDark} />
        </PressableScale>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          Umbrales de {planta.nombreComun}
        </Text>
        <View style={{ width: moderateScale(26) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Estos valores son los que el kit usa para decidir cuándo regar
          automáticamente.
        </Text>

        <Text style={styles.fieldLabel}>Humedad ideal (%)</Text>
        <FormTextInput
          label="Ej: 25"
          value={humedad}
          onChangeText={setHumedad}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>Temperatura ideal (°C)</Text>
        <FormTextInput
          label="Ej: 22"
          value={temperatura}
          onChangeText={setTemperatura}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>Luz ideal</Text>
        <View style={styles.luzRow}>
          {OPCIONES_LUZ.map((opcion) => {
            const active = opcion === luz;
            return (
              <PressableScale
                key={opcion}
                onPress={() => setLuz(opcion)}
                outerStyle={styles.luzChipOuter}
                style={[styles.luzChip, active && styles.luzChipActive]}
              >
                <Text style={[styles.luzChipLabel, active && styles.luzChipLabelActive]}>
                  {opcion}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Duración de cada pulso (segundos)</Text>
        <FormTextInput label="Ej: 3" value={pulso} onChangeText={setPulso} keyboardType="numeric" style={styles.input} />

        <Text style={styles.fieldLabel}>Espera de absorción (segundos)</Text>
        <FormTextInput label="Ej: 20" value={pausa} onChangeText={setPausa} keyboardType="numeric" style={styles.input} />

        <Text style={styles.fieldLabel}>Máximo de pulsos por riego</Text>
        <FormTextInput label="Ej: 3" value={maxPulsos} onChangeText={setMaxPulsos} keyboardType="numeric" style={styles.input} />

        <Text style={styles.fieldLabel}>Tiempo máximo total (segundos)</Text>
        <FormTextInput label="Ej: 90" value={tiempoMaximo} onChangeText={setTiempoMaximo} keyboardType="numeric" style={styles.input} />

        <PrimaryButton
          label={guardando ? 'Guardando...' : 'Guardar'}
          onPress={handleGuardar}
          disabled={guardando}
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  topBarTitle: {
    ...typography.h2,
    fontSize: moderateScale(17),
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.body,
    fontFamily: 'Inter_500Medium',
    fontSize: moderateScale(14),
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.lg,
  },
  luzRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  luzChipOuter: {
    flex: 1,
  },
  luzChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  luzChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  luzChipLabel: {
    ...typography.caption,
    fontFamily: 'Inter_500Medium',
    color: colors.textDark,
  },
  luzChipLabelActive: {
    color: colors.textOnPrimary,
  },
  saveButton: {},
});
