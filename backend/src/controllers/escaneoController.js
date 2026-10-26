const {
  identificarConGemini,
  identificarConPlantNet,
  normalizarNombreConGemini,
  obtenerParametrosConGemini,
  PARAMETROS_PROVISIONALES,
} = require('../services/escaneoService');

const COINCIDENCIA_MINIMA_PLANTNET = 20;

async function escanearPlanta(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    let candidatasPlantNet = [];

    try {
      candidatasPlantNet = await identificarConPlantNet(req.file.buffer, req.file.mimetype);
    } catch (error) {
      console.warn('PlantNet no disponible, se usará Gemini:', error.message);
    }

    if (
      candidatasPlantNet.length > 0
      && candidatasPlantNet[0].coincidencia >= COINCIDENCIA_MINIMA_PLANTNET
    ) {
      return res.json({
        candidatas: candidatasPlantNet,
        fuente: 'plantnet',
      });
    }

    try {
      const candidatasGemini = await identificarConGemini(
        req.file.buffer,
        req.file.mimetype
      );
      if (candidatasGemini.length > 0) {
        return res.json({
          candidatas: candidatasGemini,
          fuente: 'gemini',
        });
      }
    } catch (error) {
      console.warn('Gemini no disponible; se conservarán los resultados de PlantNet:', error.message);
    }

    if (candidatasPlantNet.length > 0) {
      return res.json({
        candidatas: candidatasPlantNet,
        fuente: 'plantnet_respaldo',
        advertencia: 'Gemini no está disponible. Revisa cuidadosamente la propuesta de PlantNet.',
      });
    }

    if (candidatasPlantNet.length === 0) {
      return res.status(422).json({
        rechazado: true,
        codigo: 'IDENTIFICACION_NO_DISPONIBLE',
        error: 'Los servicios de identificación no están disponibles o no encontraron una coincidencia. Puedes ingresar el nombre manualmente.',
      });
    }
  } catch (error) {
    console.error('Error en escaneo:', error.message);

    if (error.response?.status === 404) {
      return res.status(422).json({
        rechazado: true,
        error: 'No se pudo identificar ninguna planta en la foto. Asegúrate de que la planta esté bien visible.',
      });
    }

    res.status(500).json({ error: error.message });
  }
}

async function obtenerParametros(req, res) {
  try {
    const { nombreCientifico } = req.body;
    if (!nombreCientifico || typeof nombreCientifico !== 'string') {
      return res.status(400).json({ error: 'nombreCientifico es requerido' });
    }

    try {
      const parametros = await obtenerParametrosConGemini(nombreCientifico.trim());
      res.json({ parametros });
    } catch (error) {
      console.warn('Gemini no disponible para parámetros; se usarán valores provisionales:', error.message);
      res.json({
        parametros: PARAMETROS_PROVISIONALES,
        advertencia: 'No se pudo consultar Gemini. Estos parámetros son provisionales y deben ajustarse con observación.',
      });
    }
  } catch (error) {
    console.error('Error calculando parámetros:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function normalizarNombre(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return res.status(400).json({ error: 'nombre es requerido' });
    }

    const candidatas = await normalizarNombreConGemini(nombre.trim());
    if (candidatas.length === 0) {
      return res.status(422).json({
        rechazado: true,
        codigo: 'NOMBRE_NO_RECONOCIDO',
        error: 'No se reconoció una planta con ese nombre. Revisa la escritura o intenta con otro nombre.',
      });
    }

    return res.json({ candidatas, fuente: 'gemini' });
  } catch (error) {
    console.error('Error normalizando nombre manual:', error.message);
    return res.status(502).json({
      rechazado: true,
      codigo: 'NORMALIZACION_NO_DISPONIBLE',
      error: 'No se pudo validar el nombre de la planta. Intenta de nuevo o usa el escaneo por cámara.',
    });
  }
}

module.exports = { escanearPlanta, obtenerParametros, normalizarNombre };