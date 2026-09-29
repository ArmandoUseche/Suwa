# Manual técnico y de mantenimiento de SUWA

## 1. Alcance

Este documento describe la instalación, arquitectura, configuración,
interfaces y mantenimiento del sistema SUWA tal como está implementado en el
repositorio.

## 2. Arquitectura actual

```text
[Sensores y bomba]
        │
        ▼ HTTP local
[Firmware de la placa]
        │
        ├── POST /api/sensores
        ├── GET  /api/riego/comando-pendiente/:dispositivoId
        ├── GET  /api/plantas/dispositivo/:dispositivoId
        └── POST /api/riego/evento
                         │
                         ▼
              [Backend Express + MongoDB]
                         ▲
                         │ HTTPS/HTTP
                 [Aplicación móvil]
```

El backend también configura Socket.io y emite eventos, pero la comunicación
operativa de la placa se realiza mediante polling HTTP. La aplicación consulta
las APIs REST; no depende de un cliente Socket.io para mostrar las lecturas.

## 3. Estructura del repositorio

| Ruta | Responsabilidad |
|---|---|
| `app/` | Aplicación móvil React Native con Expo |
| `backend/` | API REST, persistencia y procesamiento de riegos |
| `firmware/` | Sketch Arduino del kit físico |
| `docs/` | Documentación técnica y de uso |

Archivos principales:

- `app/src/services/api.js`: cliente HTTP y selección de backend.
- `app/src/context/AppStateContext.js`: estado de plantas, kit y alertas.
- `app/src/context/AuthContext.js`: sesión y usuario.
- `app/src/navigation/RootNavigator.js`: navegación principal.
- `backend/src/index.js`: arranque del servidor.
- `backend/src/controllers/riegoController.js`: comandos y programación.
- `backend/src/controllers/sensorController.js`: lecturas y alertas anómalas.
- `backend/src/models/`: esquemas MongoDB.
- `firmware/suwa_firmware/suwa_firmware.ino`: sensores, Wi-Fi y bomba.

## 4. Requisitos de desarrollo

### Backend

- Node.js compatible con el proyecto.
- npm.
- MongoDB Atlas o MongoDB local.
- Variables de entorno del backend.

### Aplicación

- Node.js y npm.
- Expo CLI mediante `npx expo`.
- Android Studio/Expo Go si se requiere ejecución en Android.

### Firmware

- Arduino IDE.
- Placa compatible con `WiFiS3`.
- Librerías:
  - DHT sensor library de Adafruit.
  - ArduinoJson.
- Cable USB y puerto serial.

El sketch actual usa `WiFiS3.h`, `EEPROM.h`, `NVIC_SystemReset()` y `WiFiClient`;
no debe documentarse como un sketch genérico para cualquier ESP32 clásico.

## 5. Instalación del backend

```powershell
cd C:\Users\marti\Desktop\Suwa\backend
npm install
Copy-Item .env.example .env
```

Configurar `.env` sin subirlo al repositorio:

```env
PORT=3000
MONGODB_URI=<URI_DE_MONGODB>
JWT_SECRET=<SECRETO_LARGO_Y_ALEATORIO>
GEMINI_API_KEY=<CLAVE_DE_GEMINI>
PLANTNET_API_KEY=<CLAVE_DE_PLANTNET>
GMAIL_USER=<CUENTA_DE_CORREO>
GMAIL_PASS=<CREDENCIAL_DEL_SERVICIO_DE_CORREO>
```

No colocar contraseñas, tokens ni claves reales en `.env.example`, commits,
capturas o documentación pública.

Arranque de desarrollo:

```powershell
npm run dev
```

Arranque normal:

```powershell
npm start
```

El servidor escucha en todas las interfaces (`0.0.0.0`) y usa el puerto
definido por `PORT`, normalmente `3000`.

## 6. Instalación de la aplicación

```powershell
cd C:\Users\marti\Desktop\Suwa\app
npm install
npx expo start
```

La configuración del cliente está centralizada en:

`app/src/services/api.js`

La aplicación utiliza el backend remoto para las operaciones generales y
consulta el backend local para las operaciones necesarias del kit físico. La
URL local puede configurarse con:

```text
EXPO_PUBLIC_LOCAL_RIEGO_URL=http://IP_DEL_PC:3000
```

Después de cambiar una variable de Expo:

```powershell
npx expo start --clear
```

La IP debe ser la dirección IPv4 del adaptador conectado al hotspot, no
`localhost` y no la IP del teléfono.

## 7. Programación y mantenimiento del firmware

Archivo:

`firmware/suwa_firmware/suwa_firmware.ino`

### 7.1 Pines actuales

| Elemento | Pin |
|---|---:|
| DHT11 | 8 |
| Trigger ultrasónico | 9 |
| Echo ultrasónico | 10 |
| LED indicador de nivel | 11 |
| Relé/bomba | 7 |
| Sensor de humedad del suelo | A0 |

El relé es activo en bajo:

- `LOW`: bomba encendida.
- `HIGH`: bomba apagada.

### 7.2 Temporizadores

| Proceso | Intervalo |
|---|---:|
| Envío de sensores | 5 segundos |
| Consulta de comando de riego | 3 segundos |
| Consulta de umbral | 30 segundos |
| Comprobación Wi-Fi | 5 segundos |
| Resumen de diagnóstico | 60 segundos |

### 7.3 Subir una versión del firmware

1. Abrir el archivo `.ino` en Arduino IDE.
2. Seleccionar la placa compatible.
3. Seleccionar el puerto correcto.
4. Verificar las librerías DHT y ArduinoJson.
5. Compilar.
6. Pulsar **Upload**.
7. Abrir el monitor serial a 9600 baudios.
8. Confirmar el host y la conexión.

El firmware actual utiliza como host predeterminado:

```text
10.238.0.16
```

Ese valor corresponde a la red local usada durante la configuración actual.
Si la red cambia, se debe configurar el host desde el portal `SUWA-Config` o
actualizar el firmware con la IP correcta.

### 7.4 Reconfigurar Wi-Fi

1. Abrir el monitor serial a 9600 baudios.
2. Escribir `BORRAR`.
3. Pulsar Enter.
4. Conectarse desde el teléfono a la red `SUWA-Config`.
5. Abrir la dirección que indique el monitor serial.
6. Introducir SSID, contraseña e IP del backend.
7. Esperar el reinicio.

Este procedimiento borra las credenciales Wi-Fi y el host guardado, pero no
modifica el código del firmware.

### 7.5 Calibración del sensor de suelo

Las constantes actuales son:

```cpp
CRUDO_SECO = 1023
CRUDO_HUMEDO = 450
```

Para recalibrar:

1. Medir el valor analógico con el sensor seco.
2. Medir el valor con el sensor en el medio húmedo utilizado.
3. Actualizar las constantes.
4. Subir el firmware.
5. Confirmar que la humedad mostrada sea razonable.

## 8. API y contratos principales

### Sensores

```text
POST /api/sensores
GET  /api/sensores/:dispositivoId
GET  /api/sensores/:dispositivoId/ultima
```

El firmware envía:

```json
{
  "humedadSuelo": 42,
  "temperatura": 26.5,
  "humedadAmbiente": 70,
  "dispositivoId": "suwa-kit-01"
}
```

### Riego

```text
POST   /api/riego/activar
GET    /api/riego/comando-pendiente/:dispositivoId
POST   /api/riego/evento
GET    /api/riego/:dispositivoId/historial
POST   /api/riego/programado
GET    /api/riego/programado/:dispositivoId
DELETE /api/riego/programado/:dispositivoId
```

El comando manual se conserva en memoria hasta que la placa lo consulta. Si el
backend se reinicia antes de la consulta, ese comando pendiente se pierde. La
programación diaria sí se conserva en MongoDB, aunque el comando que ya está
listo para la placa se mantiene también en memoria.

### Plantas

```text
GET    /api/plantas/dispositivo/:dispositivoId
POST   /api/plantas
GET    /api/plantas
GET    /api/plantas/:id
PATCH  /api/plantas/:id
POST   /api/plantas/:id/foto
DELETE /api/plantas/:id
```

La ruta del umbral por dispositivo no usa JWT porque la placa no implementa
autenticación. Las rutas de gestión de plantas sí requieren autenticación.

### Alertas

```text
GET   /api/alertas/:dispositivoId
PATCH /api/alertas/:id/leida
PATCH /api/alertas/:dispositivoId/leidas
```

Actualmente el backend genera automáticamente una alerta de lectura anómala
cuando la humedad de suelo es menor que 5%. Los tipos de nivel de agua bajo y
falla de sistema existen en el modelo, pero no tienen generación automática
completa en el firmware actual.

## 9. Modelo de datos

- `Usuario`: cuenta, perfil y contraseña cifrada.
- `Planta`: planta del usuario, foto, parámetros y dispositivo asociado.
- `LecturaSensor`: valores de sensores y timestamp.
- `EventoRiego`: riegos manuales y automáticos ejecutados.
- `RiegoProgramado`: programación diaria persistente.
- `Alerta`: alertas y estado de lectura.
- `CodigoRecuperacion`: códigos temporales de recuperación.

Las fotos de plantas se almacenan como Data URI Base64 en MongoDB. Por ese
motivo debe controlarse el tamaño de las imágenes y el crecimiento de la base
de datos.

## 10. Mantenimiento preventivo

### Antes de una demostración

- Confirmar que MongoDB está disponible.
- Confirmar que el backend responde en `/`.
- Confirmar que el computador conserva la misma IP de la red local.
- Confirmar que la placa muestra lecturas nuevas.
- Confirmar que el depósito tiene agua.
- Probar un riego manual corto.
- Cancelar programaciones de pruebas anteriores.
- Comprobar que la bomba se detiene correctamente.

### Después de una demostración

- Detener el backend.
- Apagar la bomba.
- Limpiar y secar sensores según sus instrucciones.
- Vaciar o proteger el depósito si quedará almacenado.
- Guardar la placa y el cableado sin tensión mecánica.
- Registrar cualquier error observado.

### Mantenimiento de software

- No modificar el firmware si el riego manual y programado funcionan.
- Revisar `git status` antes de subir cambios.
- No versionar `.env`.
- Probar el bundle de Android después de cambios en la app:

```powershell
cd C:\Users\marti\Desktop\Suwa\app
npx expo export --platform android --output-dir .tmp-export
Remove-Item -Recurse -Force .tmp-export
```

- Validar sintaxis del backend:

```powershell
cd C:\Users\marti\Desktop\Suwa\backend
node --check src/index.js
node --check src/controllers/riegoController.js
```

## 11. Solución de problemas

### El backend no inicia

Comprobar:

1. Que se ejecuta desde `backend`.
2. Que existe `.env`.
3. Que `MONGODB_URI` es válida.
4. Que el puerto 3000 no esté ocupado.
5. Que las dependencias estén instaladas con `npm install`.

### La aplicación muestra una lectura desactualizada

1. Revisar que el backend local esté activo.
2. Revisar la IP del computador con:

```powershell
Get-NetIPAddress -AddressFamily IPv4
```

3. Comparar esa IP con la configurada en la aplicación y la placa.
4. Revisar el monitor serial.
5. Comprobar que aparecen lecturas cada cinco segundos.
6. Confirmar que el teléfono y el computador estén en la misma red.

### La placa no envía lecturas

Revisar en el monitor serial:

- `Host del backend en uso`.
- Estado de conexión Wi-Fi.
- Errores `BACKEND`.
- Errores `SENSOR`.

Si el host es incorrecto, reconfigurar mediante `SUWA-Config`.

### El riego manual no activa la bomba

1. Confirmar que la aplicación puede llegar al backend local.
2. Confirmar que el backend está activo.
3. Revisar que la placa consulta:

```text
GET /api/riego/comando-pendiente/suwa-kit-01
```

4. Confirmar que la bomba está conectada al relé del pin 7.
5. Confirmar la lógica activa en bajo: `LOW` enciende y `HIGH` apaga.
6. Revisar que no haya un riego automático activo.

### El riego programado no ocurre

1. Confirmar que el backend local permaneció activo hasta la hora programada.
2. Confirmar que la programación se guardó.
3. Confirmar que la fecha y hora del dispositivo sean correctas.
4. Confirmar que la placa siga conectada.
5. Revisar la consulta de comando pendiente cada tres segundos.
6. Revisar el historial después del horario.

### Las fotos no aparecen en otro dispositivo

1. Confirmar que la carga terminó sin error.
2. Confirmar que la planta se guardó en el backend.
3. Cerrar sesión y volver a iniciar.
4. Revisar que la respuesta de la planta incluya `fotoUri`.
5. Revisar el tamaño de la imagen y el límite de 5 MB.

## 12. Límites conocidos

- El kit físico utiliza actualmente el identificador `suwa-kit-01`.
- Los comandos manuales pendientes en memoria se pierden si el backend se
  reinicia antes de que la placa los consulte.
- El firmware consulta por polling HTTP; no usa Socket.io.
- Las preferencias de notificaciones de la aplicación no son push
  notifications del sistema operativo.
- El nivel de agua enciende un LED, pero todavía no genera una alerta
  persistente ni bloquea automáticamente la bomba.
- Los endpoints de sensores y alertas se identifican por dispositivo y deben
  protegerse adicionalmente si el sistema se expone a redes no confiables.
- La aplicación consulta algunas operaciones del kit local y otras del
  backend remoto; la IP local debe estar actualizada durante las demos.

