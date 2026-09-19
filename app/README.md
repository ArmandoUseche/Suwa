# Aplicación móvil SUWA

Aplicación móvil desarrollada con React Native y Expo.

## Instalación

```powershell
cd C:\Users\marti\Desktop\Suwa\app
npm install
npx expo start
```

Para limpiar la caché de Metro:

```powershell
npx expo start --clear
```

## Funcionalidades

- Registro, inicio de sesión y recuperación de contraseña.
- Escaneo e identificación de plantas.
- Gestión de plantas e imágenes persistentes.
- Monitoreo de sensores.
- Riego manual y riego programado.
- Alertas e historial.
- Edición del perfil.

## Configuración de red local

La lógica HTTP está en `src/services/api.js`. La aplicación utiliza el
backend remoto para las operaciones generales y consulta el backend local para
las operaciones que debe recibir la placa.

Si la IP del computador cambia, se puede definir:

```text
EXPO_PUBLIC_LOCAL_RIEGO_URL=http://IP_DEL_PC:3000
```

Después se debe reiniciar Expo con `npx expo start --clear`.

## Validación de compilación

```powershell
npx expo export --platform android --output-dir .tmp-export
Remove-Item -Recurse -Force .tmp-export
```

Consulta el manual completo en
`../docs/MANUAL_TECNICO_Y_MANTENIMIENTO.md` y el flujo para el usuario en
`../docs/MANUAL_DE_USO.md`.
