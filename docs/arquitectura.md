# Arquitectura de SUWA

## Diagrama de componentes (alto nivel)

```
[Sensores: humedad suelo, DHT11]
          │
          ▼
   [ESP32 / Arduino] ──HTTP POST──► [Backend: Express + Socket.io] ◄──HTTP/WS── [App móvil: React Native]
          ▲                                  │
          │                                  ▼
   [Relé + Bomba/Válvula]              [MongoDB Atlas]
```

## Flujo de datos

1. El ESP32 lee sensores cada minuto y envía `POST /api/sensores`.
2. El backend guarda la lectura en MongoDB y la emite por Socket.io
   (`nueva_lectura`) a todas las apps conectadas.
3. Si la humedad es muy baja, el backend genera una alerta
   (`nueva_alerta`) — o el propio firmware activa el riego automático
   localmente según el umbral.
4. Desde la app, el usuario puede activar riego manual
   (`POST /api/riego/activar`), lo cual emite `comando_riego` que el
   firmware debe escuchar.
5. El firmware reporta cada ciclo de riego ejecutado
   (`POST /api/riego/evento`).

## Modelo de datos (MongoDB)

- **Usuario**: nombre, correo, passwordHash
- **Planta**: nombre, usuarioId, dispositivoId, umbralHumedadMinimo
- **LecturaSensor**: humedadSuelo, temperatura, humedadAmbiente, dispositivoId, timestamp
- **EventoRiego**: tipo (automatico/manual), duracionSegundos, humedadInicial, dispositivoId, timestamp
- **Alerta**: tipo (falla_sistema/nivel_agua_bajo/lectura_anomala), mensaje, dispositivoId, leida, timestamp

## Pendiente de definir en la siguiente sesión

- Diagrama de casos de uso.
- Wireframes de las pantallas (Figma).
- Mecanismo real para que el firmware reciba `comando_riego`
  (WebSocket en ESP32 vs. polling HTTP).
