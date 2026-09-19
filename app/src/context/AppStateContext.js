import { AppState, createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DISPOSITIVO_ID } from '../constants/device';
import {
  crearPlantaAPI,
  eliminarPlantaAPI,
  getUltimaLecturaAPI,
  obtenerPlantasAPI,
  actualizarPlantaAPI,
  getAlertasAPI,
  marcarAlertaLeidaAPI,
  marcarTodasAlertasLeidasAPI,
  subirFotoPlantaAPI,
} from '../services/api';
import { useAuth } from './AuthContext';
import { illustrations } from '../constants/images';

const AppStateContext = createContext(null);
const PREFERENCIAS_POR_DEFECTO = { riego: true, humedad: true, sistema: true };
const CLAVE_PREFERENCIAS = 'preferencias-notificaciones';

function obtenerClavePreferencias(usuario) {
  const usuarioId = usuario?._id || usuario?.id || usuario?.correoOTelefono || 'anonimo';
  return `${CLAVE_PREFERENCIAS}:${usuarioId}`;
}

function alertaPermitida(alerta, preferencias) {
  const categoria = {
    nivel_agua_bajo: 'riego',
    lectura_anomala: 'humedad',
    falla_sistema: 'sistema',
  }[alerta.tipo];
  return categoria ? preferencias[categoria] : true;
}

export function AppStateProvider({ children }) {
  const { usuario } = useAuth();
  const [kitConectado, setKitConectado] = useState(false);
  const [cargandoKit, setCargandoKit] = useState(false);
  const [plantas, setPlantas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [preferenciasNotificaciones, setPreferenciasNotificaciones] = useState(PREFERENCIAS_POR_DEFECTO);
  const [cargandoPlantas, setCargandoPlantas] = useState(false);
  const consultandoKit = useRef(false);
  const clavePreferencias = obtenerClavePreferencias(usuario);

  const cargarPreferenciasNotificaciones = async () => {
    try {
      const guardadas = await AsyncStorage.getItem(clavePreferencias);
      if (!guardadas) {
        setPreferenciasNotificaciones(PREFERENCIAS_POR_DEFECTO);
        return;
      }
      const preferencias = JSON.parse(guardadas);
      setPreferenciasNotificaciones({
        ...PREFERENCIAS_POR_DEFECTO,
        ...Object.fromEntries(
          Object.keys(PREFERENCIAS_POR_DEFECTO)
            .filter((key) => typeof preferencias?.[key] === 'boolean')
            .map((key) => [key, preferencias[key]])
        ),
      });
    } catch (error) {
      console.warn('Error cargando preferencias de notificaciones:', error.message);
      setPreferenciasNotificaciones(PREFERENCIAS_POR_DEFECTO);
    }
  };

  const actualizarPreferenciaNotificacion = async (key, value) => {
    const nuevasPreferencias = { ...preferenciasNotificaciones, [key]: value };
    setPreferenciasNotificaciones(nuevasPreferencias);
    try {
      await AsyncStorage.setItem(clavePreferencias, JSON.stringify(nuevasPreferencias));
    } catch (error) {
      console.warn('Error guardando preferencias de notificaciones:', error.message);
    }
  };

  const cargarEstadoKit = async () => {
    if (consultandoKit.current) return;
    consultandoKit.current = true;
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
      consultandoKit.current = false;
    }
  };

  // Carga el estado real del kit y las plantas del usuario al iniciar sesión.
  useEffect(() => {
    if (!usuario) {
      setKitConectado(false);
      setPlantas([]);
      setAlertas([]);
      setPreferenciasNotificaciones(PREFERENCIAS_POR_DEFECTO);
      return undefined;
    }

    const cargarDatos = async () => {
      await Promise.all([
        cargarEstadoKit(),
        cargarPlantas(),
        cargarAlertas(),
        cargarPreferenciasNotificaciones(),
      ]);
    };

    cargarDatos();
    const intervaloKit = setInterval(cargarEstadoKit, 10000);
    const intervaloAlertas = setInterval(cargarAlertas, 30000);
    const suscripcionApp = AppState?.addEventListener?.('change', (estado) => {
      if (estado === 'active') {
        cargarEstadoKit();
        cargarAlertas();
        cargarPreferenciasNotificaciones();
      }
    });
    return () => {
      clearInterval(intervaloKit);
      clearInterval(intervaloAlertas);
      suscripcionApp?.remove?.();
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

  const marcarTodasAlertasLeidas = async () => {
    await marcarTodasAlertasLeidasAPI(DISPOSITIVO_ID);
    setAlertas((prev) => prev.map((alerta) => ({ ...alerta, leida: true })));
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
      fotoUri: null,
      luzIdeal: datos.luzIdeal || null,
      temperaturaIdeal: datos.temperaturaIdeal || null,
      umbralHumedadMinimo: datos.umbralHumedadMinimo || 30,
      dispositivoId: DISPOSITIVO_ID,
      enMonitoreo: true,
    });

    let plantaGuardada = res.data;
    if (datos.foto?.uri?.startsWith('file:')) {
      const fotoRes = await subirFotoPlantaAPI(res.data._id, datos.foto.uri);
      plantaGuardada = fotoRes.data;
    }

    const nuevaPlanta = {
      id: plantaGuardada._id,
      nombreComun: plantaGuardada.nombreComun,
      nombreCientifico: plantaGuardada.nombreCientifico,
      foto: plantaGuardada.fotoUri ? { uri: plantaGuardada.fotoUri } : datos.foto || null,
      luzIdeal: plantaGuardada.luzIdeal,
      temperaturaIdeal: plantaGuardada.temperaturaIdeal,
      umbralHumedadMinimo: plantaGuardada.umbralHumedadMinimo,
      enMonitoreo: plantaGuardada.enMonitoreo,
      dispositivoId: plantaGuardada.dispositivoId,
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
    const { fotoUri, ...cambiosPlanta } = cambios;
    const plantaActualizada = await actualizarPlantaAPI(plantaId, cambiosPlanta);
    let planta = plantaActualizada.data;
    if (fotoUri?.startsWith('file:')) {
      const fotoRes = await subirFotoPlantaAPI(plantaId, fotoUri);
      planta = fotoRes.data;
    }
    setPlantas((prev) => prev.map((item) => {
      if (item.id === plantaId) {
        return {
          ...item,
          ...cambiosPlanta,
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

  const alertasVisibles = alertas.filter((alerta) =>
    alertaPermitida(alerta, preferenciasNotificaciones)
  );

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
        alertasVisibles,
        preferenciasNotificaciones,
        actualizarPreferenciaNotificacion,
        marcarAlertaLeida,
        marcarTodasAlertasLeidas,
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