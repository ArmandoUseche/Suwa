# suwa-backend

API REST + tiempo real (Socket.io) para el sistema SUWA.

## Instalación

```bash
cd backend
npm install
cp .env.example .env   # y completa MONGODB_URI con tu cluster de MongoDB Atlas
npm run dev
```

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/sensores` | El firmware envía una lectura nueva (humedad, temp, etc.) |
| GET | `/api/sensores/:dispositivoId` | Historial de lecturas |
| GET | `/api/sensores/:dispositivoId/ultima` | Última lectura (para el dashboard) |
| POST | `/api/riego/activar` | La app activa el riego manualmente |
| POST | `/api/riego/evento` | El firmware confirma un ciclo de riego ejecutado |
| GET | `/api/riego/:dispositivoId/historial` | Historial de riegos |
| GET | `/api/alertas/:dispositivoId` | Alertas del dispositivo |
| PATCH | `/api/alertas/:id/leida` | Marca una alerta como leída |

## Eventos de Socket.io

- `nueva_lectura` — se emite cuando llega una lectura de sensores
- `nueva_alerta` — se emite cuando se genera una alerta automática
- `comando_riego` — se emite hacia el firmware cuando el usuario activa riego manual
- `nuevo_evento_riego` — se emite cuando se completa un ciclo de riego

## Modelos (MongoDB)

`Usuario`, `Planta`, `LecturaSensor`, `EventoRiego`, `Alerta` — ver `src/models/`.
