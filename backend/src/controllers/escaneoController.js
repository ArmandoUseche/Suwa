const { identificarConPlantNet, obtenerParametrosConGemini } = require('../services/escaneoService');

async function escanearPlanta(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    const candidatas = await identificarConPlantNet(
      req.file.buffer,
      req.file.mimetype
    );

    if (candidatas.length === 0) {
      return res.status(422).json({
        rechazado: true,
        error: 'No se encontraron coincidencias para esta imagen. Intenta con una foto más clara y enfocada en la planta.',
      });
    }

    res.json({ candidatas });
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