const {
  identificarConGemini,
  identificarConPlantNet,
  obtenerParametrosConGemini,
} = require('../services/escaneoService');

const COINCIDENCIA_MINIMA_PLANTNET = 20;

async function escanearPlanta(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    let candidatas;
    let fuente = 'plantnet';

    try {
      candidatas = await identificarConPlantNet(req.file.buffer, req.file.mimetype);
    } catch (error) {
      console.warn('PlantNet no disponible, se usará Gemini:', error.message);
      candidatas = [];
    }

    if (
      candidatas.length === 0 ||
      candidatas[0].coincidencia < COINCIDENCIA_MINIMA_PLANTNET
    ) {
      fuente = 'gemini';
      candidatas = await identificarConGemini(req.file.buffer, req.file.mimetype);
    }

    if (candidatas.length === 0) {
      return res.status(422).json({
        rechazado: true,
        error: 'No se pudo identificar la planta. Intenta con una foto más clara o ingresa su nombre manualmente.',
      });
    }

    res.json({ candidatas, fuente });
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

    const parametros = await obtenerParametrosConGemini(nombreCientifico.trim());
    res.json({ parametros });
  } catch (error) {
    console.error('Error calculando parámetros:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { escanearPlanta, obtenerParametros };