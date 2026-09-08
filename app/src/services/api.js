import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esta IP por la de tu computador cuando pruebes en el celular físico.
// Para el emulador de Android usa: http://10.0.2.2:3000
// Para Expo Go en celular físico usa: http://TU_IP_LOCAL:3000
const BASE_URL = 'http://192.168.0.14:3000';

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
  });
};

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