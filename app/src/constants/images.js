// Índice central de assets de imagen. Importar desde acá en vez de usar
// rutas relativas sueltas en cada pantalla, así si movemos un archivo
// solo se actualiza en un lugar.

export const illustrations = {
  onboardingMonitoreo: require('../assets/illustrations/onboarding-monitoreo.jpg'),
  onboardingRiego: require('../assets/illustrations/onboarding-riego.jpg'),
  onboardingAlertas: require('../assets/illustrations/onboarding-alertas.jpg'),
  welcomeHero: require('../assets/illustrations/welcome-hero-cutout.png'),
  // Foto de fondo del banner de saludo en Monitoreo (mockup: "Hola, [nombre]").
  monitoreoSaludoBg: require('../assets/illustrations/monitoreo-saludo-bg.jpg'),
  // Foto real de la planta para el círculo de Monitoreo (reemplaza el
  // ícono placeholder que se usaba antes).
  monitoreoPlantaFoto: require('../assets/illustrations/monitoreo-planta-foto.jpg'),
  // Ilustración del estado vacío de Historial (gráfica de barras 3D).
  // Fondo original quitado con PIL para que flote sobre cualquier color
  // de fondo, igual que welcome-hero-cutout.
  historialVacio: require('../assets/illustrations/historial-vacio-ilustracion.png'),
  // Escanear: foto de ejemplo en el intro (mismo tipo de planta que
  // detecta el kit) + fotos de ejemplo del modal de Consejos. Las de
  // Consejos vienen ya con su propio fondo (no son cutouts), se recortan
  // a cuadrado con resizeMode="cover" al mostrarse, no hace falta
  // preprocesarlas más.
  escanearEjemplo: require('../assets/illustrations/escanear-planta-ejemplo.jpg'),
  consejoVioleta: require('../assets/illustrations/consejo-violeta.jpg'),
  consejoSuculenta: require('../assets/illustrations/consejo-suculenta.jpg'),
  // Versión ya desenfocada (con PIL, GaussianBlur) de la misma foto de
  // arriba -- para el ejemplo "incorrecto" del consejo 2. Antes se
  // intentaba desenfocar en vivo con BlurView (expo-blur), pero en
  // Android ese blur muchas veces no se renderiza de verdad. Con la
  // imagen ya borrosa de antemano, se ve igual en cualquier dispositivo.
  consejoSuculentaBorrosa: require('../assets/illustrations/consejo-suculenta-borrosa.jpg'),
  consejoManzanillaCorrecta: require('../assets/illustrations/consejo-manzanilla-correcta.jpg'),
  consejoDosPlantasIncorrecta: require('../assets/illustrations/consejo-dos-plantas-incorrecta.jpg'),
  // Ilustración del estado vacío de Mis Plantas (maceta + cruz verde).
  misPlantasVacio: require('../assets/illustrations/mis-plantas-vacio.jpg'),
};

export const logo = {
  full: require('../assets/logo/logo-suwa.jpg'),
  mark: require('../assets/logo/logo-mark-white.png'),
};

export const icons = {
  avatar: require('../assets/icons/avatar.png'),
  calendario: require('../assets/icons/calendario.png'),
  casa: require('../assets/icons/casa.png'),
  configuracion: require('../assets/icons/configuracion-gear.png'),
  destello: require('../assets/icons/destello.png'),
  dom: require('../assets/icons/dom.png'),
  escaneoQr: require('../assets/icons/escaneo-de-codigo-qr.png'),
  escaner: require('../assets/icons/escaner.png'),
  estadoSenal: require('../assets/icons/estado-de-la-senal.png'),
  gotaAgua: require('../assets/icons/gota-de-agua.png'),
  historia: require('../assets/icons/historia.png'),
  imagenes: require('../assets/icons/imagenes.png'),
  informacion: require('../assets/icons/informacion.png'),
  notificacion: require('../assets/icons/notificacion.png'),
  planta: require('../assets/icons/planta.png'),
  soleado: require('../assets/icons/soleado.png'),
  soltar: require('../assets/icons/soltar.png'),
  temperaturaAlta: require('../assets/icons/temperatura-alta.png'),
  voltear: require('../assets/icons/voltear.png'),
};
