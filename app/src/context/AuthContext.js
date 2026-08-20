import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginAPI, registroAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app verifica si ya hay sesión guardada
  useEffect(() => {
    async function cargarSesion() {
      try {
        const token = await AsyncStorage.getItem('token');
        const usuarioGuardado = await AsyncStorage.getItem('usuario');
        if (token && usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.log('Error cargando sesión:', error);
      } finally {
        setCargando(false);
      }
    }
    cargarSesion();
  }, []);

  async function login(correoOTelefono, contrasena) {
    const res = await loginAPI({ correoOTelefono, contrasena });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    setUsuario(res.data.usuario);
    return res.data;
  }

  async function registro(nombre, apellidos, correoOTelefono, contrasena) {
    const res = await registroAPI({ nombre, apellidos, correoOTelefono, contrasena });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    setUsuario(res.data.usuario);
    return res.data;
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}