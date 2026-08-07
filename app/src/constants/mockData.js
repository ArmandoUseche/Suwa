// Datos de ejemplo para construir la pantalla de Monitoreo sin depender
// todavía del backend. La forma de este objeto sigue el modelo real
// LecturaSensor del contrato de API (mismos nombres de campo, en español
// y camelCase) para que conectar el endpoint GET
// /api/sensores/:dispositivoId/ultima más adelante sea solo cambiar de
// dónde sale el dato, no cómo se muestra.
export const mockUltimaLectura = {
  dispositivoId: 'suwa-esp32-01',
  humedadSuelo: 42,
  temperatura: 24.5,
  humedadAmbiente: 58,
  timestamp: new Date().toISOString(),
};

// Cantidad de alertas sin leer, para el badge del ícono de notificaciones.
// Cuando se conecte el socket (evento `nueva_alerta`) y el endpoint
// GET /api/alertas/:dispositivoId, este valor sale de ahí en vez de estar
// fijo acá.
export const mockAlertasNoLeidas = 2;
