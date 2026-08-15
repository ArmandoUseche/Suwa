import { createContext, useContext, useState } from 'react';

import { mockAlertas, mockPlantas, mockTieneDispositivoVinculado } from '../constants/mockData';

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
  const [alertas, setAlertas] = useState(mockAlertas);

  const vincularDispositivo = () => setTieneDispositivoVinculado(true);

  // Se llama al tocar una alerta en AlertasScreen. Real:
  // PATCH /api/alertas/:id/leida cuando se conecte (ver
  // puntos-abiertos-backend.md).
  const marcarAlertaLeida = (alertaId) => {
    setAlertas((prev) => prev.map((a) => (a.id === alertaId ? { ...a, leida: true } : a)));
  };

  const actualizarUmbrales = (plantaId, cambios) => {
    setPlantas((prev) => prev.map((p) => (p.id === plantaId ? { ...p, ...cambios } : p)));
  };

  // Agrega una planta nueva a la lista -- se llama desde
  // ResultadoEscaneoScreen ("Añadir a mis plantas"). La planta nueva
  // arranca `enMonitoreo: false`: solo puede haber una planta conectada
  // al kit físico a la vez, y agregarla acá no cambia sola cuál es esa
  // (eso pasa al vincular el kit a una planta puntual, algo que todavía
  // no está construido -- por ahora todas las plantas nuevas entran
  // como "sin conectar", igual que el Potus de ejemplo).
  const agregarPlanta = (datos) => {
    const nuevaPlanta = {
      id: `pl-${Date.now()}`,
      enMonitoreo: false,
      humedadActual: null,
      humedadEstado: null,
      kitConexion: null,
      ...datos,
    };
    setPlantas((prev) => [...prev, nuevaPlanta]);
    return nuevaPlanta;
  };

  return (
    <AppStateContext.Provider
      value={{
        tieneDispositivoVinculado,
        vincularDispositivo,
        plantas,
        actualizarUmbrales,
        agregarPlanta,
        alertas,
        marcarAlertaLeida,
      }}
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
