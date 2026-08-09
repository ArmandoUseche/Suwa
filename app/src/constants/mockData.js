// Datos de ejemplo para construir la pantalla de Monitoreo sin depender
// todavía del backend. La forma de este objeto sigue el modelo real
// LecturaSensor del contrato de API (mismos nombres de campo, en español
// y camelCase) para que conectar el endpoint GET
// /api/sensores/:dispositivoId/ultima más adelante sea solo cambiar de
// dónde sale el dato, no cómo se muestra.
export const mockUltimaLectura = {
  dispositivoId: 'suwa-esp32-01',
  humedadSuelo: 25,
  temperatura: 22,
  humedadAmbiente: 55,
  timestamp: new Date().toISOString(),
};

// Etiquetas de estado por lectura (ej. "Óptimo", "Ideal"), tal como se
// ven en el mockup del dashboard conectado. Son solo texto mock por
// ahora — cuando haya umbrales reales configurados por planta
// (`umbralHumedadMinimo` del modelo Planta), esto se calcularía a
// partir de esos umbrales en vez de estar fijo acá.
export const mockEstadosLectura = {
  humedadSuelo: 'Óptimo',
  temperatura: 'Ideal',
  humedadAmbiente: 'Muy buena',
};

// Estado general de la planta y próximo riego automático programado,
// para la tarjeta "Planta" del dashboard conectado.
export const mockEstadoPlanta = {
  estado: 'saludable',
  proximoRiegoTexto: 'Automatización: próximo riego hoy a las 6:00pm',
};

// Cantidad de alertas sin leer, para el badge del ícono de notificaciones.
// Cuando se conecte el socket (evento `nueva_alerta`) y el endpoint
// GET /api/alertas/:dispositivoId, este valor sale de ahí en vez de estar
// fijo acá.
export const mockAlertasNoLeidas = 2;

// Nombre del usuario logueado, para el saludo "Hola, {nombre}" y
// "¡Comencemos, {nombre}!" en Monitoreo. Placeholder hasta que haya un
// estado de sesión real (login conectado al backend) del que sacarlo.
export const mockUsuario = {
  nombre: 'Jose',
};

// Si el usuario ya vinculó un dispositivo o no. Con esto en `false`,
// Monitoreo muestra la pantalla de "Vincular dispositivo" (mockup);
// en `true` mostraría el dashboard de sensores. Cuando haya backend real,
// esto sale de si el usuario tiene o no una Planta/dispositivo asociado.
export const mockTieneDispositivoVinculado = false;

// Historial también tiene dos estados, pero son independientes del de
// arriba: un usuario puede tener el kit vinculado desde hace un minuto
// y todavía no tener ninguna lectura ni riego registrado. Con esto en
// `false` se ve "Sin registros aún" (mockup); en `true`, la gráfica +
// lista de abajo. Cuando se conecte el histórico real (GET
// /api/sensores/:dispositivoId), esto sale de si esa respuesta viene
// vacía o no.
export const mockTieneDatosHistorial = false;

// Lecturas mock de la semana para la gráfica de Historial, una por día.
// El modelo real (LecturaSensor) trae una lectura por cada rato del
// kit, no una por día -- esto ya viene pre-agregado (promedio del día)
// como lo pediría el selector "Semana". Cuando se conecte la API real,
// ese agregado se calcularía a partir del historial completo en vez de
// estar hardcodeado acá.
export const mockLecturasSemana = [
  { dia: 'Dom', humedadSuelo: 30, temperatura: 21, humedadAmbiente: 58 },
  { dia: 'Lun', humedadSuelo: 26, temperatura: 22, humedadAmbiente: 55 },
  { dia: 'Mar', humedadSuelo: 22, temperatura: 23, humedadAmbiente: 52 },
  { dia: 'Mié', humedadSuelo: 28, temperatura: 22, humedadAmbiente: 54 },
  { dia: 'Jue', humedadSuelo: 33, temperatura: 24, humedadAmbiente: 57 },
  { dia: 'Vie', humedadSuelo: 25, temperatura: 22, humedadAmbiente: 55 },
  { dia: 'Sáb', humedadSuelo: 27, temperatura: 21, humedadAmbiente: 56 },
];

// Registros recientes (mezcla de EventoRiego y Alerta) para la lista de
// abajo de Historial. `tipo` decide el ícono y el color del círculo --
// ver HistorialRecordItem. Los campos siguen los nombres de los modelos
// reales del contrato de API (EventoRiego: tipo/duracionSegundos/
// humedadInicial, Alerta: tipo/mensaje) aunque acá vienen ya resueltos a
// un título+descripción para mostrar directo, sin lógica de formato en
// la pantalla.
export const mockRegistrosRecientes = [
  {
    id: 'r1',
    tipo: 'riego_automatico',
    titulo: 'Registro automático',
    descripcion: '+150ml · humedad alcanzó 72%',
    horaTexto: 'hoy, 6:00 PM',
  },
  {
    id: 'r2',
    tipo: 'alerta',
    titulo: 'Humedad baja',
    descripcion: 'Suelo cayó al 28%',
    horaTexto: 'hoy, 6:00 PM',
  },
  {
    id: 'r3',
    tipo: 'riego_manual',
    titulo: 'Riego manual',
    descripcion: 'Activado desde la app',
    horaTexto: 'hoy, 6:00 PM',
  },
];
