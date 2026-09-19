import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esto según el contexto: true = backend local (para demos con
// el Arduino, que no puede hablarle a Render por HTTPS), false = Render.
const USAR_BACKEND_LOCAL = false;

const BASE_URL = USAR_BACKEND_LOCAL
  ? 'http://192.168.101.5:3000' 
  : 'https://suwa-rrg5.onrender.com';

const LOCAL_RIEGO_URLS = [
  process.env.EXPO_PUBLIC_LOCAL_RIEGO_URL,
  'http://192.168.101.5:3000',
  'http://10.238.0.16:3000',
  'http://192.168.43.1:3000',
  'http://192.168.0.5:3000',
  'http://192.168.1.5:3000',
].filter(Boolean);

const obtenerTimestampLectura = (lectura) => {
  if (!lectura) return Number.NaN;
  const valor = lectura.timestamp ?? lectura.createdAt;
  const timestamp = valor ? new Date(valor).getTime() : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
};

async function consultarBackendLocal(endpoint, metodo = 'get', datos = undefined) {
  const errores = [];

  for (const baseUrl of LOCAL_RIEGO_URLS) {
    try {
      const config = { timeout: 5000 };
      if (metodo === 'get') {
        const respuesta = await axios.get(`${baseUrl}${endpoint}`, config);
        return respuesta;
      }
      if (metodo === 'post') {
        const respuesta = await axios.post(`${baseUrl}${endpoint}`, datos, config);
        return respuesta;
      }
      if (metodo === 'delete') {
        const respuesta = await axios.delete(`${baseUrl}${endpoint}`, config);
        return respuesta;
      }
      throw new Error(`Método no soportado: ${metodo}`);
    } catch (error) {
      errores.push(error);
    }
  }

  const error = new Error('No se pudo comunicar con el backend local del kit. Verifica que el PC tenga el backend activo y que el teléfono esté en la misma red.');
  error.code = 'BACKEND_LOCAL_NO_DISPONIBLE';
  error.causa = errores[0] ?? null;
  throw error;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor: agrega el token JWT automáticamente a cada petición
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── AUTH ──
export const registroAPI = (datos) =>
  api.post('/api/auth/registro', datos);

export const loginAPI = (datos) =>
  api.post('/api/auth/login', datos);

export const cambiarContrasenaAPI = (datos) =>
  api.patch('/api/auth/cambiar-contrasena', datos);

export const actualizarPerfilAPI = (datos) =>
  api.patch('/api/auth/perfil', datos);

// ── SENSORES ──
export const getUltimaLecturaAPI = async (dispositivoId) => {
  if (USAR_BACKEND_LOCAL) {
    return api.get(`/api/sensores/${dispositivoId}/ultima`);
  }

  const resultados = await Promise.allSettled([
    api.get(`/api/sensores/${dispositivoId}/ultima`),
    consultarBackendLocal(`/api/sensores/${dispositivoId}/ultima`, 'get'),
  ]);

  const lecturas = resultados
    .filter((resultado) => resultado.status === 'fulfilled')
    .map((resultado) => resultado.value)
    .filter((respuesta) => Number.isFinite(obtenerTimestampLectura(respuesta?.data)));

  if (lecturas.length === 0) {
    const error = resultados.find((resultado) => resultado.status === 'rejected')?.reason
      || new Error('No se pudo obtener la última lectura del kit.');
    throw error;
  }

  return lecturas.reduce((masReciente, actual) => (
    obtenerTimestampLectura(actual.data) > obtenerTimestampLectura(masReciente.data)
      ? actual
      : masReciente
  ));
};

export const analizarEstadoRiegoAPI = async (dispositivoId, umbralHumedadMinimo) => {
  const res = await getUltimaLecturaAPI(dispositivoId);
  const lectura = res.data;
  const timestamp = obtenerTimestampLectura(lectura);

  if (!lectura || !Number.isFinite(timestamp) || Date.now() - timestamp > 60000) {
    const error = new Error('La última lectura del kit está desactualizada.');
    error.code = 'LECTURA_KIT_DESACTUALIZADA';
    throw error;
  }

  return {
    lectura,
    humedadAlta: Number.isFinite(Number(lectura.humedadSuelo))
      && Number.isFinite(Number(umbralHumedadMinimo))
      && Number(lectura.humedadSuelo) >= Number(umbralHumedadMinimo),
  };
};

export const getHistorialSensoresAPI = (dispositivoId) =>
  api.get(`/api/sensores/${dispositivoId}`);

// ── RIEGO ──
export const activarRiegoAPI = async (dispositivoId, duracionSegundos = 10) => {
  const datos = { dispositivoId, duracionSegundos };

  if (USAR_BACKEND_LOCAL) {
    return api.post('/api/riego/activar', datos);
  }

  const [renderResult, localResult] = await Promise.allSettled([
    api.post('/api/riego/activar', datos),
    consultarBackendLocal('/api/riego/activar', 'post', datos),
  ]);

  if (localResult.status === 'rejected') {
    const error = new Error(
      'No se pudo entregar la orden al backend local que consulta el kit. '
      + 'Verifica que el backend esté iniciado y que el teléfono y el PC estén en la misma red.'
    );
    error.code = 'BACKEND_LOCAL_NO_DISPONIBLE';
    error.causa = localResult.reason;
    throw error;
  }

  return renderResult.status === 'fulfilled' ? renderResult.value : localResult.value;
};

export const getHistorialRiegoAPI = (dispositivoId) =>
  api.get(`/api/riego/${dispositivoId}/historial`);

const enviarProgramacionLocal = (datos) =>
  consultarBackendLocal('/api/riego/programado', 'post', datos);

export const programarRiegoAPI = async (datos) => {
  if (USAR_BACKEND_LOCAL) return api.post('/api/riego/programado', datos);

  const [renderResult, localResult] = await Promise.allSettled([
    api.post('/api/riego/programado', datos),
    enviarProgramacionLocal(datos),
  ]);
  if (localResult.status === 'rejected') {
    const error = new Error('No se pudo entregar la programación al backend local que consulta el kit.');
    error.code = 'BACKEND_LOCAL_NO_DISPONIBLE';
    error.causa = localResult.reason;
    throw error;
  }
  return renderResult.status === 'fulfilled' ? renderResult.value : localResult.value;
};

export const obtenerRiegoProgramadoAPI = async (dispositivoId) => {
  if (USAR_BACKEND_LOCAL) {
    return api.get(`/api/riego/programado/${dispositivoId}`);
  }

  const [renderResult, localResult] = await Promise.allSettled([
    api.get(`/api/riego/programado/${dispositivoId}`),
    consultarBackendLocal(`/api/riego/programado/${dispositivoId}`, 'get'),
  ]);
  if (renderResult.status === 'fulfilled') return renderResult.value;
  if (localResult.status === 'fulfilled') return localResult.value;
  throw renderResult.reason || localResult.reason;
};

export const cancelarRiegoProgramadoAPI = async (dispositivoId) => {
  if (USAR_BACKEND_LOCAL) return api.delete(`/api/riego/programado/${dispositivoId}`);

  const [renderResult, localResult] = await Promise.allSettled([
    api.delete(`/api/riego/programado/${dispositivoId}`),
    consultarBackendLocal(`/api/riego/programado/${dispositivoId}`, 'delete'),
  ]);
  if (localResult.status === 'rejected') {
    const error = new Error('No se pudo cancelar la programación en el backend local.');
    error.code = 'BACKEND_LOCAL_NO_DISPONIBLE';
    error.causa = localResult.reason;
    throw error;
  }
  return renderResult.status === 'fulfilled' ? renderResult.value : localResult.value;
};

// ── ALERTAS ──
export const getAlertasAPI = (dispositivoId) =>
  api.get(`/api/alertas/${dispositivoId}`);

export const marcarAlertaLeidaAPI = (id) =>
  api.patch(`/api/alertas/${id}/leida`);

export const marcarTodasAlertasLeidasAPI = (dispositivoId) =>
  api.patch(`/api/alertas/${dispositivoId}/leidas`);

// ── RECUPERACIÓN DE CONTRASEÑA ──
export const olvideContrasenaAPI = (correoOTelefono) =>
  api.post('/api/auth/olvide-contrasena', { correoOTelefono });

export const verificarCodigoAPI = (correoOTelefono, codigo) =>
  api.post('/api/auth/verificar-codigo', { correoOTelefono, codigo });

export const nuevaContrasenaAPI = (correoOTelefono, codigo, contrasenaNueva) =>
  api.post('/api/auth/nueva-contrasena', { correoOTelefono, codigo, contrasenaNueva });

// ── ESCANEO ──
export const escanearPlantaAPI = async (fotoUri) => {
  const formData = new FormData();
  formData.append('foto', {
    uri: fotoUri,
    type: 'image/jpeg',
    name: 'planta.jpg',
  });

  return api.post('/api/escaneo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 130000,
  });
};

export const obtenerParametrosPlantaAPI = (nombreCientifico) =>
  api.post('/api/escaneo/parametros', { nombreCientifico });

// ── PLANTAS ──
export const crearPlantaAPI = (datos) =>
  api.post('/api/plantas', datos);

export const subirFotoPlantaAPI = (id, fotoUri) => {
  const formData = new FormData();
  formData.append('foto', {
    uri: fotoUri,
    type: 'image/jpeg',
    name: 'planta.jpg',
  });
  return api.post(`/api/plantas/${id}/foto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
};

export const obtenerPlantasAPI = () =>
  api.get('/api/plantas');

export const obtenerPlantaAPI = (id) =>
  api.get(`/api/plantas/${id}`);

export const actualizarPlantaAPI = (id, datos) =>
  api.patch(`/api/plantas/${id}`, datos);

export const eliminarPlantaAPI = (id) =>
  api.delete(`/api/plantas/${id}`);

export default api;