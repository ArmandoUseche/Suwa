import { illustrations } from './images';

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

// Datos del usuario logueado, para el saludo "Hola, {nombre}" en
// Monitoreo y para la pantalla de Perfil (Paso 8). Placeholder hasta
// que haya un estado de sesión real (login conectado al backend) del
// que sacarlo -- `usuario` es el nombre de usuario derivado del correo
// (antes del @), como en el mockup, no algo que se pida aparte en el
// registro (RegisterScreen no tiene un campo de usuario separado).
export const mockUsuario = {
  nombre: 'Jose',
  apellidos: 'Pérez',
  correo: 'jose.perez@gmail.com',
  usuario: 'jose.perez',
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

// Resultado del escaneo: 2 IAs, 2 fuentes de datos distintas, mock
// hasta tener las API keys reales.
//  1. PlantNet identifica la especie -- en la versión real se la llama
//     2 veces seguidas para confirmar que la identificación no fue
//     casualidad (si las 2 llamadas no coinciden, ahí se le pediría
//     otra foto a la persona en vez de mostrar un resultado dudoso).
//  2. Con la especie ya CONFIRMADA por PlantNet, se la manda a Gemini
//     (una IA aparte, prompteada para calcular parámetros de riego).
//     PlantNet no sabe nada de humedad/temperatura/luz -- eso es
//     trabajo exclusivo de Gemini, por diseño son 2 fuentes separadas,
//     no un solo resultado plano.
export const mockIdentificacionPlantNet = {
  nombreComun: 'Lengua de suegra',
  nombreCientifico: 'Sansevieria trifasciata',
  coincidencia: 98,
};

export const mockParametrosGemini = {
  humedadIdeal: 25,
  temperaturaIdeal: 22,
  luzIdeal: 'Media',
};

// Mis Plantas tiene 3 estados, no 2 -- distinto de Historial/Escanear
// porque acá el estado "sin kit" y el estado "sin plantas" son cosas
// separadas (podés tener el kit conectado y aun así no haber agregado
// ninguna planta todavía):
//  1. mockTieneDispositivoVinculado en false -> "vincular dispositivo"
//     (misma bandera que ya usan Monitoreo/Historial/Escanear, no se
//     repite acá).
//  2. Con el kit vinculado y `plantas` vacío -> "Sin registros aún"
//     con foto+cruz verde (mockup real). Antes esto tenía su propia
//     bandera (mockTienePlantas) separada del array -- se sacó porque
//     ahora que "Añadir a mis plantas" sí agrega de verdad (ver
//     AppStateContext.agregarPlanta), tener 2 fuentes de verdad
//     (la bandera Y el array) se podían desincronizar entre sí. Ahora
//     "¿tiene plantas?" es simplemente plantas.length > 0 en la
//     pantalla, calculado del array de acá abajo -- para probar el
//     estado vacío, vaciá este array directamente.
//  3. Con plantas -> la lista de acá abajo.

// Cada planta puede o no estar "en monitoreo" (conectada al kit físico
// AHORA MISMO). Solo puede haber una planta en monitoreo a la vez (un
// kit físico), las demás son plantas ya escaneadas pero sin datos en
// vivo -- mismo diseño de tarjeta, sin el punto verde ni el gráfico.
export const mockPlantas = [
  {
    id: 'pl1',
    nombreComun: 'Lengua de suegra',
    nombreCientifico: 'Sansevieria trifasciata',
    // La foto real es la que se toma al momento de escanear (fotoUri
    // de la cámara) -- acá se reusa un asset existente como foto mock,
    // ya que no hay persistencia real todavía entre plantas escaneadas
    // y esta lista (ver LEEME de esta entrega).
    foto: illustrations.monitoreoPlantaFoto,
    enMonitoreo: true,
    humedadActual: 25,
    humedadEstado: 'Óptimo, estable',
    luzIdeal: 'Indirecta brillante',
    kitConexion: 'estable', // 'estable' | 'inestable'
  },
  {
    id: 'pl2',
    nombreComun: 'Potus',
    nombreCientifico: 'Epipremnum aureum',
    foto: illustrations.consejoSuculenta,
    enMonitoreo: false,
    humedadActual: null,
    humedadEstado: null,
    luzIdeal: 'Media',
    kitConexion: null,
  },
];
