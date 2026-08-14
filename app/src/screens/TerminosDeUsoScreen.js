import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SolidHeaderBar from '../components/SolidHeaderBar';
import { colors, spacing, typography } from '../constants/theme';

// Términos de uso (Paso 8). Texto PLACEHOLDER genérico -- no es
// contenido legal real, alguien con criterio legal (o al menos el
// equipo completo) tiene que revisarlo y reemplazarlo antes de
// publicar la app de verdad. Para la sustentación académica alcanza
// con que la pantalla exista y se vea bien.
export default function TerminosDeUsoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Términos de uso" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Última actualización: [completar]</Text>

        <Text style={styles.heading}>1. Aceptación de los términos</Text>
        <Text style={styles.paragraph}>
          Al usar SUWA aceptás estos términos de uso. Si no estás de
          acuerdo con alguna parte, no deberías usar la aplicación.
        </Text>

        <Text style={styles.heading}>2. Uso del servicio</Text>
        <Text style={styles.paragraph}>
          SUWA te permite monitorear y automatizar el riego de tus
          plantas mediante un kit conectado. El servicio se ofrece "tal
          cual", sin garantías sobre disponibilidad continua ni
          precisión absoluta de los sensores.
        </Text>

        <Text style={styles.heading}>3. Cuenta de usuario</Text>
        <Text style={styles.paragraph}>
          Sos responsable de mantener la confidencialidad de tu
          contraseña y de toda la actividad que ocurra en tu cuenta.
        </Text>

        <Text style={styles.heading}>4. Identificación de plantas</Text>
        <Text style={styles.paragraph}>
          La identificación de especies y los parámetros de riego
          sugeridos se generan mediante servicios de inteligencia
          artificial de terceros y pueden no ser exactos en todos los
          casos.
        </Text>

        <Text style={styles.heading}>5. Cambios en estos términos</Text>
        <Text style={styles.paragraph}>
          Podemos actualizar estos términos en cualquier momento. El uso
          continuado de la app después de un cambio implica la
          aceptación de los nuevos términos.
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
