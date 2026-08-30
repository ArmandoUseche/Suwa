const { identificarConPlantNet, obtenerParametrosConGemini } = require('../services/escaneoService');

const UMBRAL_MINIMO = 60; // % mínimo de coincidencia aceptable

async function escanearPlanta(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    // ── LLAMADA 1 a PlantNet ──
    const identificacion1 = await identificarConPlantNet(
      req.file.buffer,
      req.file.mimetype
    );

    // Verificar umbral en la primera llamada
    if (identificacion1.coincidencia < UMBRAL_MINIMO) {
      return res.status(422).json({
        rechazado: true,
        coincidencia: identificacion1.coincidencia,
        error: `Se obtuvo solo un ${identificacion1.coincidencia}% de coincidencia. Intenta con una foto más clara, con buena iluminación y enfocando solo la planta.`,
      });
    }

    // ── LLAMADA 2 a PlantNet para confirmar ──
    const identificacion2 = await identificarConPlantNet(
      req.file.buffer,
      req.file.mimetype
    );

    // Verificar que las dos llamadas coincidan en la especie
    if (identificacion1.nombreCientifico !== identificacion2.nombreCientifico) {
      return res.status(422).json({
        rechazado: true,
        coincidencia: identificacion1.coincidencia,
        error: `La identificación no fue consistente entre dos intentos. Intenta con una foto más clara y enfocada en una sola parte de la planta.`,
      });
    }

    // Verificar umbral en la segunda llamada también
    if (identificacion2.coincidencia < UMBRAL_MINIMO) {
      return res.status(422).json({
        rechazado: true,
        coincidencia: identificacion2.coincidencia,
        error: `Se obtuvo solo un ${identificacion2.coincidencia}% de coincidencia en la confirmación. Intenta con una foto más clara.`,
      });
    }

    // Promedio de coincidencia de las dos llamadas
    const coincidenciaPromedio = Math.round(
      (identificacion1.coincidencia + identificacion2.coincidencia) / 2
    );

    const identificacionFinal = {
      ...identificacion1,
      coincidencia: coincidenciaPromedio,
    };

    // ── Gemini calcula los parámetros con la especie confirmada ──
    const parametros = await obtenerParametrosConGemini(
      identificacionFinal.nombreCientifico
    );

    res.json({
      identificacion: identificacionFinal,
      parametros,
    });

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

module.exports = { escanearPlanta };