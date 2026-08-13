import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { RozhaOne_400Regular } from '@expo-google-fonts/rozha-one';

import RootNavigator from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/context/AppStateContext';

export default function App() {
  // Las tipografías del mockup (Rozha One para títulos, Inter para el
  // resto) no vienen instaladas en el sistema, hay que cargarlas antes
  // de mostrar cualquier pantalla -- si no, React Native usa la fuente
  // del sistema mientras carga y el texto "salta" de una fuente a otra.
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    RozhaOne_400Regular,
  });

  if (!fontsLoaded) {
    // Splash ya se ve nativo mientras tanto; no hace falta un loader acá.
    return null;
  }

  return (
    // GestureHandlerRootView tiene que envolver todo para que los gestos
    // de React Navigation (swipe back, etc.) funcionen en Android.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
