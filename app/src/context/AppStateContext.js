import { createContext, useContext, useEffect, useState } from 'react';
import { DISPOSITIVO_ID } from '../constants/device';
import {
  crearPlantaAPI,
  eliminarPlantaAPI,
  getUltimaLecturaAPI,
  obtenerPlantasAPI,
} from '../services/api';
import { useAuth } from './AuthContext';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const { usuario } = useAuth();
  const [kitConectado, setKitConectado] = useState(false);
  const [cargandoKit, setCargandoKit] = useState(false);
  const [plantas, setPlantas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargandoPlantas, setCargandoPlantas] = useState(false);

  const cargarEstadoKit = async () => {
    setCargandoKit(true);
    try {
      const res = await getUltimaLecturaAPI(DISPOSITIVO_ID);
      const timestamp = new Date(res.data.timestamp).getTime();
      const lecturaReciente = Number.isFinite(timestamp)
        && Date.now() - timestamp <= 30000;
      setKitConectado(lecturaReciente);
    } catch (error) {
      setKitConectado(false);
    } finally {
      setCargandoKit(false);
    }
  };

  // Carga el estado real del kit y las plantas del usuario al iniciar sesión.
  useEffect(() => {
    if (!usuario) {
      setKitConectado(false);
      setPlantas([]);
      setAlertas([]);
      return undefined;
    }

    const cargarDatos = async () => {
      await Promise.all([cargarEstadoKit(), cargarPlantas()]);
    };

    cargarDatos();
    const intervalo = setInterval(cargarEstadoKit, 10000);
    return () => clearInterval(intervalo);
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
      dispositivoId: DISPOSITIVO_ID,
      enMonitoreo: true,
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

  const eliminarPlanta = async (plantaId) => {
    await eliminarPlantaAPI(plantaId);
    setPlantas((prev) => prev.filter((planta) => planta.id !== plantaId));
  };

  return (
    <AppStateContext.Provider
      value={{
        kitConectado,
        cargandoKit,
        plantas,
        cargandoPlantas,
        cargarPlantas,
        actualizarUmbrales,
        agregarPlanta,
        eliminarPlanta,
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