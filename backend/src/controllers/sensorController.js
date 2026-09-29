const LecturaSensor = require('../models/LecturaSensor');
const Alerta = require('../models/Alerta');

const UMBRAL_ANOMALIA_HUMEDAD = 5; // % - por debajo de esto se considera lectura anómala

async function registrarLectura(req, res) {
  try {
    const { humedadSuelo, temperatura, humedadAmbiente, dispositivoId } = req.body;

    if (
      humedadSuelo === undefined ||
      temperatura === undefined ||
      humedadAmbiente === undefined ||
      !dispositivoId
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const lectura = await LecturaSensor.create({
      humedadSuelo,
      temperatura,
      humedadAmbiente,
      dispositivoId,
    });

    // Detección simple de lectura anómala
    if (humedadSuelo < UMBRAL_ANOMALIA_HUMEDAD) {
      const alerta = await Alerta.create({
        tipo: 'lectura_anomala',
        mensaje: `Humedad de suelo anómalamente baja (${humedadSuelo}%)`,
        dispositivoId,
      });
      req.app.get('io').emit('nueva_alerta', alerta);
    }

    // Emitir en tiempo real a los clientes conectados (app móvil)
    req.app.get('io').emit('nueva_lectura', lectura);

    res.status(201).json(lectura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerHistorial(req, res) {
  try {
    const { dispositivoId } = req.params;
    const { limite = 100 } = req.query;

    const lecturas = await LecturaSensor.find({ dispositivoId })
      .sort({ timestamp: -1 })
      .limit(Number(limite));

    res.json(lecturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerUltimaLectura(req, res) {
  try {
    const { dispositivoId } = req.params;
    const lectura = await LecturaSensor.findOne({ dispositivoId }).sort({ timestamp: -1 });

    if (!lectura) {
      return res.status(404).json({ error: 'Sin lecturas para este dispositivo' });
    }

    res.json(lectura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registrarLectura, obtenerHistorial, obtenerUltimaLectura };
