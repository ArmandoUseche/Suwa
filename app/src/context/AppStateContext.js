import { createContext, useContext, useState } from 'react';

import { mockPlantas, mockTieneDispositivoVinculado } from '../constants/mockData';

// Estado compartido de la app que SÍ cambia en vivo mientras la usás
// (a diferencia de la mayoría de los mocks del proyecto, que son
// valores fijos que se editan a mano en mockData.js y piden recargar).
// Hasta ahora no hacía falta -- nada "hacía" la acción de vincular un
// dispositivo, solo mostrábamos el resultado ya vinculado o no. Ahora
// que existe una pantalla real de "Vincular dispositivo", tiene sentido
// que tocar el botón se refleje al toque en toda la app.
//
// Arranca desde los mismos valores mock de siempre (mockData.js), así
// que para probar el estado inicial "sin vincular"/"sin plantas" seguís
// editando esos mismos mocks como hasta ahora -- lo que cambia es que,
// una vez que la app está corriendo, vincular un dispositivo o guardar
// umbrales SÍ tiene efecto real dentro de esa sesión (se pierde al
// recargar, porque sigue sin haber backend -- eso es esperado).
const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [tieneDispositivoVinculado, setTieneDispositivoVinculado] = useState(
    mockTieneDispositivoVinculado
  );
  const [plantas, setPlantas] = useState(mockPlantas);

  const vincularDispositivo = () => setTieneDispositivoVinculado(true);

  const actualizarUmbrales = (plantaId, cambios) => {
    setPlantas((prev) => prev.map((p) => (p.id === plantaId ? { ...p, ...cambios } : p)));
  };

  return (
    <AppStateContext.Provider
      value={{ tieneDispositivoVinculado, vincularDispositivo, plantas, actualizarUmbrales }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState tiene que usarse adentro de <AppStateProvider>');
  }
  return ctx;
}
