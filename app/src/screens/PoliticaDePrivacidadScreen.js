import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SolidHeaderBar from '../components/SolidHeaderBar';
import { colors, spacing, typography } from '../constants/theme';

// Política de privacidad (Paso 8). Mismo criterio que Términos de uso:
// texto PLACEHOLDER genérico, no contenido legal real. Reemplazar
// antes de publicar la app de verdad -- para la sustentación académica
// alcanza con que la pantalla exista y se vea bien.
export default function PoliticaDePrivacidadScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Política de privacidad" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Última actualización: [completar]</Text>

        <Text style={styles.heading}>1. Qué datos recopilamos</Text>
        <Text style={styles.paragraph}>
          Datos de tu cuenta (nombre, correo), lecturas de tus sensores
          (humedad, temperatura), y las fotos que tomás al escanear tus
          plantas.
        </Text>

        <Text style={styles.heading}>2. Para qué los usamos</Text>
        <Text style={styles.paragraph}>
          Para mostrarte el estado de tus plantas, calcular cuándo
          regar automáticamente, e identificar especies mediante
          servicios de inteligencia artificial de terceros (PlantNet,
          Gemini).
        </Text>

        <Text style={styles.heading}>3. Con quién compartimos datos</Text>
        <Text style={styles.paragraph}>
          Las fotos que tomás se envían a PlantNet y Gemini únicamente
          para identificar la especie y calcular sus necesidades de
          riego. No vendemos tus datos a terceros.
        </Text>

        <Text style={styles.heading}>4. Tus derechos</Text>
        <Text style={styles.paragraph}>
          Podés pedir que eliminemos tu cuenta y los datos asociados en
          cualquier momento desde Contáctanos.
        </Text>

        <Text style={styles.heading}>5. Seguridad</Text>
        <Text style={styles.paragraph}>
          Tomamos medidas razonables para proteger tu información, pero
          ningún sistema es 100% seguro.
        </Text>
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
  updated: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    fontSize: 16,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  paragraph: {
    ...typography.body,
    color: colors.textMuted,
  },
});
