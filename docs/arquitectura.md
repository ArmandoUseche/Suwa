# Arquitectura de SUWA

## Diagrama de componentes (alto nivel)

```
[Sensores: humedad suelo, DHT11]
          │
          ▼
   [Placa WiFiS3] ──HTTP──► [Backend: Express + Socket.io] ◄──HTTP── [App móvil: React Native]
          ▲                                  │
          │                                  ▼
   [Relé + Bomba/Válvula]              [MongoDB Atlas]
```

## Flujo de datos

1. El firmware lee sensores cada cinco segundos y envía `POST /api/sensores`.
2. El backend guarda la lectura en MongoDB y la emite por Socket.io
   (`nueva_lectura`) a todas las apps conectadas.
3. Si la humedad es muy baja, el backend genera una alerta
   (`nueva_alerta`) — o el propio firmware activa el riego automático
   localmente según el umbral.
4. Desde la app, el usuario puede activar riego manual
   (`POST /api/riego/activar`). El backend guarda el comando pendiente y el
   firmware lo recoge mediante polling HTTP en
   `GET /api/riego/comando-pendiente/:dispositivoId`.
5. El firmware reporta cada ciclo de riego ejecutado
   (`POST /api/riego/evento`).

## Modelo de datos (MongoDB)

- **Usuario**: nombre, correo, passwordHash
- **Planta**: nombre, usuarioId, dispositivoId, umbralHumedadMinimo
- **LecturaSensor**: humedadSuelo, temperatura, humedadAmbiente, dispositivoId, timestamp
- **EventoRiego**: tipo (automatico/manual), duracionSegundos, humedadInicial, dispositivoId, timestamp
- **Alerta**: tipo (falla_sistema/nivel_agua_bajo/lectura_anomala), mensaje, dispositivoId, leida, timestamp

## Alcance actual

- El firmware utiliza polling HTTP para recibir comandos.
- Socket.io permanece disponible en el backend para eventos, aunque la app
  actual consulta el estado mediante REST y no mantiene un cliente Socket.io.
- Los wireframes y diagramas de análisis pueden agregarse como material
  académico independiente sin modificar este flujo operativo.
## Nota de arquitectura — Frontend

El cliente de usuario es una **aplicación móvil nativa** desarrollada con
**React Native (Expo)**, ubicada en `app/`. No existe una versión web del
dashboard; se descartó un scaffold inicial en Vite/React (web) para
mantener coherencia con la Propuesta de Proyecto aprobada por el Comité
Curricular, que especifica React Native como tecnología de frontend.