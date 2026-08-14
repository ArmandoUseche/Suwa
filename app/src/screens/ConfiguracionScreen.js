import { ScrollView, StyleSheet, View } from 'react-native';

import SolidHeaderBar from '../components/SolidHeaderBar';
import SettingsRow from '../components/SettingsRow';
import { colors, radius, spacing } from '../constants/theme';

// Configuración (Paso 8, se llega desde la tuerca en Perfil). 4 filas
// del mockup, cada una navega a su propia pantalla.
export default function ConfiguracionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SolidHeaderBar title="Configuración" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <SettingsRow
            label="Notificación"
            onPress={() => navigation.navigate('Notificaciones')}
          />
          <View style={styles.divider} />
          <SettingsRow
            label="Terms of use"
            onPress={() => navigation.navigate('TerminosDeUso')}
          />
          <View style={styles.divider} />
          <SettingsRow
            label="Privacy policy"
            onPress={() => navigation.navigate('PoliticaDePrivacidad')}
          />
          <View style={styles.divider} />
          <SettingsRow label="Contact us" onPress={() => navigation.navigate('Contactanos')} />
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});
