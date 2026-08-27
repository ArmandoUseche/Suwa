const { identificarConPlantNet, obtenerParametrosConGemini } = require('../services/escaneoService');

async function escanearPlanta(req, res) {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    // Paso 1: PlantNet identifica la especie
    const identificacion = await identificarConPlantNet(
      req.file.buffer,
      req.file.mimetype
    );

    // Paso 2: Gemini calcula los parámetros con el nombre científico
    const parametros = await obtenerParametrosConGemini(
      identificacion.nombreCientifico
    );

    res.json({
      identificacion,
      parametros,
    });
  } catch (error) {
    console.error('Error en escaneo:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'No se pudo identificar la planta. Intenta con otra foto más clara.',
      });
    }

    res.status(500).json({ error: error.message });
  }
}

module.exports = { escanearPlanta };