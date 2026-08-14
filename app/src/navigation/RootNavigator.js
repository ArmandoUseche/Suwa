import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterSuccessScreen from '../screens/RegisterSuccessScreen';
import EscanearCameraScreen from '../screens/EscanearCameraScreen';
import ResultadoEscaneoScreen from '../screens/ResultadoEscaneoScreen';
import PlantaDetalleScreen from '../screens/PlantaDetalleScreen';
import VincularDispositivoScreen from '../screens/VincularDispositivoScreen';
import ConfigurarUmbralesScreen from '../screens/ConfigurarUmbralesScreen';
import CambiarContrasenaScreen from '../screens/CambiarContrasenaScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import TerminosDeUsoScreen from '../screens/TerminosDeUsoScreen';
import PoliticaDePrivacidadScreen from '../screens/PoliticaDePrivacidadScreen';
import ContactanosScreen from '../screens/ContactanosScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

// Navegador raíz de la app. Por ahora tiene el onboarding completo (Paso 2)
// y el flujo de auth en construcción (Paso 3: Welcome ya está, Login y
// Register siguen como stub hasta que se completen). El tab navigator se
// agrega en el Paso 4.
export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      {/* Fuera del tab navigator a propósito: la cámara ocupa toda la
          pantalla, sin la barra de tabs abajo. presentation "fullScreenModal"
          hace que en iOS entre deslizando de abajo hacia arriba, como una
          cámara real. */}
      <Stack.Screen
        name="EscanearCamara"
        component={EscanearCameraScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ResultadoEscaneo" component={ResultadoEscaneoScreen} />
      <Stack.Screen name="PlantaDetalle" component={PlantaDetalleScreen} />
      <Stack.Screen name="VincularDispositivo" component={VincularDispositivoScreen} />
      <Stack.Screen name="ConfigurarUmbrales" component={ConfigurarUmbralesScreen} />
      <Stack.Screen name="CambiarContrasena" component={CambiarContrasenaScreen} />
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
      <Stack.Screen name="TerminosDeUso" component={TerminosDeUsoScreen} />
      <Stack.Screen name="PoliticaDePrivacidad" component={PoliticaDePrivacidadScreen} />
      <Stack.Screen name="Contactanos" component={ContactanosScreen} />
    </Stack.Navigator>
  );
}
