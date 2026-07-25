const EventoRiego = require('../models/EventoRiego');

// Activa el riego manualmente: emite un comando por socket que el firmware escucha
async function activarRiego(req, res) {
  try {
    const { dispositivoId, duracionSegundos = 10 } = req.body;

    if (!dispositivoId) {
      return res.status(400).json({ error: 'dispositivoId es requerido' });
    }

    req.app.get('io').emit('comando_riego', { dispositivoId, duracionSegundos });

    res.json({ ok: true, mensaje: 'Comando de riego enviado', dispositivoId, duracionSegundos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// El firmware llama este endpoint cuando termina un ciclo de riego (manual o automático)
async function registrarEvento(req, res) {
  try {
    const { tipo, duracionSegundos, humedadInicial, dispositivoId } = req.body;

    if (!tipo || !dispositivoId) {
      return res.status(400).json({ error: 'tipo y dispositivoId son requeridos' });
    }

    const evento = await EventoRiego.create({
      tipo,
      duracionSegundos,
      humedadInicial,
      dispositivoId,
    });

    req.app.get('io').emit('nuevo_evento_riego', evento);

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerHistorial(req, res) {
  try {
    const { dispositivoId } = req.params;
    const eventos = await EventoRiego.find({ dispositivoId }).sort({ timestamp: -1 }).limit(100);
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { activarRiego, registrarEvento, obtenerHistorial };
