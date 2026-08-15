import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
// El contrato de API original solo tiene `umbralHumedadMinimo` (un
// número) en el modelo Planta -- acá se editan 3 valores porque son
// los que ya veníamos mostrando (humedad/temperatura/luz ideal, los
// que calcula Gemini). Si el backend termina guardando menos de estos
// 3 campos, es sacar el que sobre del formulario, no rehacerlo (ver
// puntos-abiertos-backend.md, punto 2).
export default function ConfigurarUmbralesScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { plantaId } = route.params ?? {};
  const { plantas, actualizarUmbrales } = useAppState();
  const planta = plantas.find((p) => p.id === plantaId) ?? plantas[0];

  // Los hooks tienen que llamarse siempre, así que el `?.` de acá evita
  // que truene ANTES de llegar al resguardo de abajo si `planta` viniera
  // undefined (plantas vacío) -- el resguardo en sí no puede ir antes de
  // estas líneas por la misma razón (reglas de hooks de React).
  const [humedad, setHumedad] = useState(String(planta?.humedadActual ?? ''));
  const [temperatura, setTemperatura] = useState(String(planta?.temperaturaIdeal ?? ''));
  const [luz, setLuz] = useState(planta?.luzIdeal ?? 'Media');

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

  const handleGuardar = () => {
    actualizarUmbrales(planta.id, {
      humedadActual: Number(humedad) || planta.humedadActual,
      temperaturaIdeal: Number(temperatura) || planta.temperaturaIdeal,
      luzIdeal: luz,
    });
    navigation.goBack();
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

        <PrimaryButton label="Guardar" onPress={handleGuardar} style={styles.saveButton} />
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
