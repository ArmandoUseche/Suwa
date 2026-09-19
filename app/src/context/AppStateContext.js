import { createContext, useContext, useEffect, useState } from 'react';
import { DISPOSITIVO_ID } from '../constants/device';
import {
  crearPlantaAPI,
  eliminarPlantaAPI,
  getUltimaLecturaAPI,
  obtenerPlantasAPI,
  actualizarPlantaAPI,
  getAlertasAPI,
  marcarAlertaLeidaAPI,
} from '../services/api';
import { useAuth } from './AuthContext';
import { illustrations } from '../constants/images';

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
      await Promise.all([cargarEstadoKit(), cargarPlantas(), cargarAlertas()]);
    };

    cargarDatos();
    const intervaloKit = setInterval(cargarEstadoKit, 10000);
    const intervaloAlertas = setInterval(cargarAlertas, 30000);
    return () => {
      clearInterval(intervaloKit);
      clearInterval(intervaloAlertas);
    };
  }, [usuario]);

  const cargarPlantas = async () => {
    setCargandoPlantas(true);
    try {
      const res = await obtenerPlantasAPI();
      const plantasFormateadas = res.data.map((p) => ({
        id: p._id,
        nombreComun: p.nombreComun,
        nombreCientifico: p.nombreCientifico,
        foto: p.fotoUri ? { uri: p.fotoUri } : illustrations.escanearEjemplo,
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

  const cargarAlertas = async () => {
    try {
      const res = await getAlertasAPI(DISPOSITIVO_ID);
      const alertasFormateadas = (Array.isArray(res.data) ? res.data : []).map((alerta) => ({
        id: alerta._id,
        tipo: alerta.tipo,
        mensaje: alerta.mensaje,
        dispositivoId: alerta.dispositivoId,
        leida: Boolean(alerta.leida),
        timestamp: alerta.timestamp,
      }));
      setAlertas(alertasFormateadas);
    } catch (error) {
      console.warn('Error cargando alertas:', error.message);
    }
  };

  const marcarAlertaLeida = async (alertaId) => {
    const alerta = alertas.find((item) => item.id === alertaId);
    if (!alerta || alerta.leida) return;

    try {
      await marcarAlertaLeidaAPI(alertaId);
      setAlertas((prev) =>
        prev.map((a) => (a.id === alertaId ? { ...a, leida: true } : a))
      );
    } catch (error) {
      console.warn('Error marcando alerta como leída:', error.message);
    }
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

    setPlantas((prev) => [
      nuevaPlanta,
      ...prev.map((planta) =>
        planta.dispositivoId === DISPOSITIVO_ID
          ? { ...planta, enMonitoreo: false }
          : planta
      ),
    ]);
    return nuevaPlanta;
  };

  const eliminarPlanta = async (plantaId) => {
    await eliminarPlantaAPI(plantaId);
    setPlantas((prev) => prev.filter((planta) => planta.id !== plantaId));
  };

  const actualizarPlanta = async (plantaId, cambios) => {
    const plantaActualizada = await actualizarPlantaAPI(plantaId, cambios);
    const planta = plantaActualizada.data;
    setPlantas((prev) => prev.map((item) => {
      if (item.id === plantaId) {
        return {
          ...item,
          ...cambios,
          foto: planta.fotoUri ? { uri: planta.fotoUri } : item.foto,
          enMonitoreo: planta.enMonitoreo,
        };
      }
      if (cambios.enMonitoreo && item.dispositivoId === DISPOSITIVO_ID) {
        return { ...item, enMonitoreo: false };
      }
      return item;
    }));
    return planta;
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
        actualizarPlanta,
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