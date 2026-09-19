# suwa-backend

API REST + tiempo real (Socket.io) para el sistema SUWA.

## Instalación

```bash
cd backend
npm install
cp .env.example .env   # y completa MONGODB_URI con tu cluster de MongoDB Atlas
npm run dev
```

Para la guía completa de instalación, operación, mantenimiento y solución de
problemas, consulta `../docs/MANUAL_TECNICO_Y_MANTENIMIENTO.md`.

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
| PATCH | `/api/alertas/:dispositivoId/leidas` | Marca todas las alertas como leídas |
| POST | `/api/riego/programado` | Crea o reemplaza el riego diario |
| GET | `/api/riego/programado/:dispositivoId` | Consulta la programación activa |
| DELETE | `/api/riego/programado/:dispositivoId` | Cancela la programación |

## Eventos de Socket.io

- `nueva_lectura` — se emite cuando llega una lectura de sensores
- `nueva_alerta` — se emite cuando se genera una alerta automática
- `comando_riego` — se emite hacia el firmware cuando el usuario activa riego manual
- `nuevo_evento_riego` — se emite cuando se completa un ciclo de riego

La placa no consume estos eventos directamente. Para recibir órdenes, consulta
`GET /api/riego/comando-pendiente/:dispositivoId` mediante polling HTTP.

## Modelos (MongoDB)

`Usuario`, `Planta`, `LecturaSensor`, `EventoRiego`, `Alerta` — ver `src/models/`.
