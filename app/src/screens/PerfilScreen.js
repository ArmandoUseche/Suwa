import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import SettingsRow from '../components/SettingsRow';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

export default function PerfilScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { usuario, logout } = useAuth();

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          <View style={{ width: moderateScale(28) }} />
          <PressableScale onPress={() => navigation.navigate('Configuracion')} hitSlop={12}>
            <Ionicons name="settings-outline" size={moderateScale(24)} color={colors.primary} />
          </PressableScale>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar} />
        </View>
        <Text style={styles.nombre}>{usuario?.nombre}</Text>

        <View style={styles.card}>
          <SettingsRow label="Correo" value={usuario?.correoOTelefono} />
          <View style={styles.divider} />
          <SettingsRow
            label="Usuario"
            value={usuario?.correoOTelefono?.split('@')[0]}
          />
          <View style={styles.divider} />
          <SettingsRow
            label="Nombre"
            value={`${usuario?.nombre} ${usuario?.apellidos}`}
          />
        </View>

        <View style={styles.card}>
          <SettingsRow
            label="Cambiar contraseña"
            onPress={() => navigation.navigate('CambiarContrasena')}
          />
        </View>

        <View style={styles.card}>
          <SettingsRow
            label="Cerrar sesión"
            subtitle={usuario?.correoOTelefono}
            danger
            onPress={handleCerrarSesion}
          />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: colors.surface,
  },
  nombre: {
    ...typography.h1,
    fontSize: moderateScale(24),
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});