import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PressableScale from '../components/PressableScale';
import SettingsRow from '../components/SettingsRow';
import { mockUsuario } from '../constants/mockData';
import { colors, radius, spacing, typography } from '../constants/theme';
import { moderateScale } from '../utils/responsive';

// Perfil (Paso 8). No hay estado "sin perfil" -- hace falta cuenta
// para entrar a la app, así que siempre hay datos que mostrar (a
// diferencia de Monitoreo/Historial/Escanear/Mis Plantas, acá no hay
// pantalla vacía).
export default function PerfilScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleCerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          // Vuelve a la pantalla de Bienvenida y borra todo el stack de
          // navegación de por medio -- así el botón de volver del
          // celular no puede regresar a pantallas de una sesión que ya
          // cerró.
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
        <Text style={styles.nombre}>{mockUsuario.nombre}</Text>

        <View style={styles.card}>
          <SettingsRow label="Gmail" value={mockUsuario.correo} />
          <View style={styles.divider} />
          <SettingsRow label="Usuario" value={mockUsuario.usuario} />
          <View style={styles.divider} />
          <SettingsRow label="Nombre" value={`${mockUsuario.nombre} ${mockUsuario.apellidos}`} />
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
            subtitle={mockUsuario.correo}
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
