import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
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
import { moderateScale } from '../utils/responsive';

const Tab = createBottomTabNavigator();

// Tamaño de letra "ideal" (el que se usaría si hubiera espacio de
// sobra). El tamaño real que se ve en pantalla casi siempre es más
// chico que esto -- ver TabLabelScaleContext más abajo.
const TAB_LABEL_SIZE = moderateScale(10, 0.3);

// Ya se probaron dos enfoques que no funcionaron:
//  1. Calcular un tamaño de letra fijo "a ciegas" por fórmula -- cortaba
//     texto en celulares reales porque no hay forma de medir el ancho
//     real de la fuente sin un dispositivo.
//  2. `adjustsFontSizeToFit` por label -- en Android cada etiqueta se
//     achica un % distinto según lo larga que sea, así que las 4 quedan
//     de tamaños visiblemente distintos entre sí (peor que el corte).
//
// Solución real: MEDIR en el propio dispositivo. Cada TabIcon renderiza
// una copia invisible de su label sin límite de ancho (para saber cuánto
// mide "de verdad" ese texto) y compara contra el ancho real de su
// columna (medido con onLayout). Con eso calcula el factor de reducción
// que necesitaría. Todas las columnas reportan ese factor acá, a este
// contexto compartido, y se usa el factor MÁS CHICO de las 4 para las 4
// por igual -- así ninguna se corta y todas quedan del mismo tamaño,
// sin depender de ningún número adivinado.
//
// El "piso" (0.5) es solo para no llegar a un tamaño ilegible en un
// celular extremadamente angosto; si el ancho real pide bajar más que
// eso, se prefiere texto chico pero completo (con el respaldo de
// adjustsFontSizeToFit de abajo) antes que "…" cortado, que no dice
// nada.
const TabLabelScaleContext = createContext({ scale: 0.75, report: () => {} });

function TabLabelScaleProvider({ children }) {
  const measurements = useRef({});
  const [scale, setScale] = useState(0.75);

  const report = useCallback((key, requiredScale) => {
    measurements.current[key] = requiredScale;
    const values = Object.values(measurements.current);
    const min = Math.min(1, ...values);
    const clamped = Math.max(0.5, min);
    setScale((prev) => (Math.abs(prev - clamped) > 0.01 ? clamped : prev));
  }, []);

  return (
    <TabLabelScaleContext.Provider value={{ scale, report }}>
      {children}
    </TabLabelScaleContext.Provider>
  );
}

// Ícono + label de un tab normal (Monitoreo, Historial, Mis plantas, Perfil).
// Tintamos el PNG con la propiedad tintColor en vez de tener dos assets
// (activo/inactivo) por ícono.
function TabIcon({ source, label, focused }) {
  const tint = focused ? colors.primary : colors.textMuted;
  const { scale, report } = useContext(TabLabelScaleContext);
  const containerWidth = useRef(null);
  const naturalWidth = useRef(null);

  const maybeReport = () => {
    if (containerWidth.current != null && naturalWidth.current != null) {
      report(label, containerWidth.current / naturalWidth.current);
    }
  };

  return (
    <View
      style={styles.tabIconWrapper}
      onLayout={(e) => {
        containerWidth.current = e.nativeEvent.layout.width;
        maybeReport();
      }}
    >
      <Image
        source={source}
        style={[styles.tabIcon, { tintColor: tint }]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.tabLabel,
          { color: tint, fontSize: TAB_LABEL_SIZE * scale, lineHeight: TAB_LABEL_SIZE * scale * 1.1 },
        ]}
        numberOfLines={1}
        // Respaldo final: si por lo que sea (celular más angosto que el
        // piso de 0.5, o el primer frame antes de que termine de medir)
        // igual no entra, que la letra se achique sola en vez de
        // cortarse con "…". No debería notarse en el uso normal, porque
        // el tamaño ya viene calculado arriba para que entre.
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
      {/* Copia invisible sin límite de ancho, solo para medir cuánto
          ocupa este texto "de verdad" a tamaño base. position:absolute
          para que no afecte el layout real de la columna. */}
      <Text
        style={[styles.tabLabel, styles.measureLabel]}
        numberOfLines={1}
        onLayout={(e) => {
          naturalWidth.current = e.nativeEvent.layout.width;
          maybeReport();
        }}
      >
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
    <TabLabelScaleProvider>
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
            // El botón central no tiene texto: en vez de compartir el
            // mismo flex que los otros 4 (que sí tienen label), se le da
            // un ancho FIJO (justo el que necesita el círculo) y flex:0,
            // para que quede totalmente afuera del reparto flex. Así los
            // otros 4 se dividen el ancho restante completo entre ellos
            // (antes competían también por el espacio del botón).
            tabBarItemStyle: [styles.tabBarItem, styles.scanBarItem],
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
    </TabLabelScaleProvider>
  );
}

// Estas son las medidas "base" (sin el inset de seguridad inferior, que
// se suma aparte según el dispositivo). Se escalan con moderateScale para
// que la barra no se vea diminuta en un tablet ni exagerada en un celular
// chico.
const TAB_BAR_HEIGHT = moderateScale(76, 0.3);
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
  scanBarItem: {
    paddingHorizontal: 0,
    flex: 0,
    width: SCAN_BUTTON_SIZE + moderateScale(12),
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
    lineHeight: TAB_LABEL_SIZE * 1.1,
    textAlign: 'center',
  },
  // Copia invisible usada solo para medir el ancho real del texto sin
  // límite de ancho. position:'absolute' para que no ocupe espacio ni
  // afecte el layout real de la columna.
  measureLabel: {
    position: 'absolute',
    opacity: 0,
    left: -9999,
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
