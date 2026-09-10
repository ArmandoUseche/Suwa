import { createContext, useContext, useEffect, useState } from 'react';
import { mockAlertas, mockTieneDispositivoVinculado } from '../constants/mockData';
import { crearPlantaAPI, obtenerPlantasAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const { usuario } = useAuth();
  const [tieneDispositivoVinculado, setTieneDispositivoVinculado] = useState(
    mockTieneDispositivoVinculado
  );
  const [plantas, setPlantas] = useState([]);
  const [alertas, setAlertas] = useState(mockAlertas);
  const [cargandoPlantas, setCargandoPlantas] = useState(false);

  // Carga las plantas del usuario desde MongoDB al iniciar sesión
  useEffect(() => {
  if (!usuario) {
    setPlantas([]);
    return;
  }
  // Pequeño delay para asegurar que el token ya está en AsyncStorage
  const timer = setTimeout(() => {
    cargarPlantas();
  }, 500);
  return () => clearTimeout(timer);
}, [usuario]);

  const cargarPlantas = async () => {
    setCargandoPlantas(true);
    try {
      const res = await obtenerPlantasAPI();
      const plantasFormateadas = res.data.map((p) => ({
        id: p._id,
        nombreComun: p.nombreComun,
        nombreCientifico: p.nombreCientifico,
        foto: p.fotoUri ? { uri: p.fotoUri } : null,
        luzIdeal: p.luzIdeal,
        temperaturaIdeal: p.temperaturaIdeal,
        umbralHumedadMinimo: p.umbralHumedadMinimo,
        enMonitoreo: p.enMonitoreo,
        dispositivoId: p.dispositivoId,
        humedadActual: null,
        humedadEstado: null,
        kitConexion: null,
      }));
      setPlantas(plantasFormateadas);
    } catch (error) {
      console.log('Error cargando plantas:', error.message);
    } finally {
      setCargandoPlantas(false);
    }
  };

  const vincularDispositivo = () => setTieneDispositivoVinculado(true);

  const marcarAlertaLeida = (alertaId) => {
    setAlertas((prev) =>
      prev.map((a) => (a.id === alertaId ? { ...a, leida: true } : a))
    );
  };

  const actualizarUmbrales = (plantaId, cambios) => {
    setPlantas((prev) =>
      prev.map((p) => (p.id === plantaId ? { ...p, ...cambios } : p))
    );
  };

  const agregarPlanta = async (datos) => {
    const res = await crearPlantaAPI({
      nombreComun: datos.nombreComun,
      nombreCientifico: datos.nombreCientifico,
      fotoUri: datos.foto?.uri || null,
      luzIdeal: datos.luzIdeal || null,
      temperaturaIdeal: datos.temperaturaIdeal || null,
      umbralHumedadMinimo: datos.umbralHumedadMinimo || 30,
    });

    const nuevaPlanta = {
      id: res.data._id,
      nombreComun: res.data.nombreComun,
      nombreCientifico: res.data.nombreCientifico,
      foto: res.data.fotoUri ? { uri: res.data.fotoUri } : datos.foto || null,
      luzIdeal: res.data.luzIdeal,
      temperaturaIdeal: res.data.temperaturaIdeal,
      umbralHumedadMinimo: res.data.umbralHumedadMinimo,
      enMonitoreo: res.data.enMonitoreo,
      dispositivoId: res.data.dispositivoId,
      humedadActual: null,
      humedadEstado: null,
      kitConexion: null,
    };

    setPlantas((prev) => [nuevaPlanta, ...prev]);
    return nuevaPlanta;
  };

  return (
    <AppStateContext.Provider
      value={{
        tieneDispositivoVinculado,
        vincularDispositivo,
        plantas,
        cargandoPlantas,
        cargarPlantas,
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