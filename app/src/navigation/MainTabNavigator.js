import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MonitoreoScreen from '../screens/MonitoreoScreen';
import HistorialScreen from '../screens/HistorialScreen';
import EscanearScreen from '../screens/EscanearScreen';
import MisPlantasScreen from '../screens/MisPlantasScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PressableScale from '../components/PressableScale';
import { icons } from '../constants/images';
import { colors, spacing, typography } from '../constants/theme';
import { moderateScale, screen } from '../utils/responsive';

const Tab = createBottomTabNavigator();

// La barra tiene 5 espacios iguales (4 tabs + el botón de Escanear), así
// que cada uno recibe screen.width / 5. Calculamos el tamaño de letra
// más grande que deja entrar la etiqueta MÁS LARGA ("Mis plantas", 11
// caracteres) en una sola línea dentro de ese espacio, y usamos ese
// mismo tamaño para las 4 etiquetas.
//
// El intento anterior (factor 0.56) todavía se cortaba en el celular de
// Joselin — el ancho real de un caracter en negrita resultó ser mayor a
// lo estimado. Subimos el factor a 0.78 (bastante más conservador) y
// bajamos el peso de fuente a '500' (en vez de '600', que es más ancho)
// para tener margen de sobra en vez de quedar de nuevo justos.
const TAB_SLOT_WIDTH = screen.width / 5 - 6; // 6 = padding de aire
const LONGEST_LABEL_CHARS = 'Mis plantas'.length;
const rawLabelSize = TAB_SLOT_WIDTH / (LONGEST_LABEL_CHARS * 0.78);
const TAB_LABEL_SIZE = Math.min(Math.max(rawLabelSize, 8), 11);

// Ícono + label de un tab normal (Monitoreo, Historial, Mis plantas, Perfil).
// Tintamos el PNG con la propiedad tintColor en vez de tener dos assets
// (activo/inactivo) por ícono.
function TabIcon({ source, label, focused }) {
  const tint = focused ? colors.primary : colors.textMuted;
  return (
    <View style={styles.tabIconWrapper}>
      <Image
        source={source}
        style={[styles.tabIcon, { tintColor: tint }]}
        resizeMode="contain"
      />
      <Text style={[styles.tabLabel, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// Botón central de Escanear (mockup): círculo verde elevado por encima
// de la barra, sin label. Se define como tabBarButton propio en vez de
// tabBarIcon normal porque necesita salirse del layout de la barra.
function ScanTabButton({ onPress }) {
  return (
    <PressableScale
      onPress={onPress}
      outerStyle={styles.scanButtonWrapper}
      scaleTo={0.92}
    >
      <View style={styles.scanButton}>
        <Image
          source={icons.escaner}
          style={styles.scanIcon}
          resizeMode="contain"
        />
      </View>
    </PressableScale>
  );
}

export default function MainTabNavigator() {
  // En celulares con barra de gestos (Android) o home indicator (iPhone),
  // la barra de tabs necesita este espacio extra abajo; si no, el sistema
  // la tapa parcialmente o los toques quedan muy pegados al borde.
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom + spacing.xs }],
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Monitoreo"
        component={MonitoreoScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.casa} label="Monitoreo" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Historial"
        component={HistorialScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.historia}
              label="Historial"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Escanear"
        component={EscanearScreen}
        options={{
          tabBarButton: (props) => <ScanTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="MisPlantas"
        component={MisPlantasScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.planta}
              label="Mis plantas"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.avatar} label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Estas son las medidas "base" (sin el inset de seguridad inferior, que
// se suma aparte según el dispositivo). Se escalan con moderateScale para
// que la barra no se vea diminuta en un tablet ni exagerada en un celular
// chico.
const TAB_BAR_HEIGHT = moderateScale(68, 0.3);
const SCAN_BUTTON_SIZE = moderateScale(56);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  tabBarItem: {
    paddingHorizontal: 0,
  },
  tabIconWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 0,
  },
  tabIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
  },
  tabLabel: {
    ...typography.caption,
    fontFamily: 'Inter_500Medium',
    fontSize: TAB_LABEL_SIZE,
  },
  scanButtonWrapper: {
    top: -moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scanButton: {
    width: SCAN_BUTTON_SIZE,
    height: SCAN_BUTTON_SIZE,
    borderRadius: SCAN_BUTTON_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra para que se note que "flota" sobre la barra.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  scanIcon: {
    width: moderateScale(26),
    height: moderateScale(26),
    tintColor: colors.textOnPrimary,
  },
});
