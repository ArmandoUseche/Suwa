import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esto según el contexto: true = backend local (para demos con
// el Arduino, que no puede hablarle a Render por HTTPS), false = Render.
const USAR_BACKEND_LOCAL = false;

const BASE_URL = USAR_BACKEND_LOCAL
  ? 'http://192.168.101.5:3000' 
  : 'https://suwa-rrg5.onrender.com';

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

// ── SENSORES ──
export const getUltimaLecturaAPI = (dispositivoId) =>
  api.get(`/api/sensores/${dispositivoId}/ultima`);

export const getHistorialSensoresAPI = (dispositivoId) =>
  api.get(`/api/sensores/${dispositivoId}`);

// ── RIEGO ──
export const activarRiegoAPI = (dispositivoId, duracionSegundos = 10) =>
  api.post('/api/riego/activar', { dispositivoId, duracionSegundos });

export const getHistorialRiegoAPI = (dispositivoId) =>
  api.get(`/api/riego/${dispositivoId}/historial`);

// ── ALERTAS ──
export const getAlertasAPI = (dispositivoId) =>
  api.get(`/api/alertas/${dispositivoId}`);

export const marcarAlertaLeidaAPI = (id) =>
  api.patch(`/api/alertas/${id}/leida`);

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

export const obtenerPlantasAPI = () =>
  api.get('/api/plantas');

export const obtenerPlantaAPI = (id) =>
  api.get(`/api/plantas/${id}`);

export const actualizarPlantaAPI = (id, datos) =>
  api.patch(`/api/plantas/${id}`, datos);

export const eliminarPlantaAPI = (id) =>
  api.delete(`/api/plantas/${id}`);

export default api;