const EventoRiego = require('../models/EventoRiego');

// Comandos de riego pendientes de que el firmware los recoja, en memoria
// (no en Mongo): se guardan acá cuando la app pide un riego manual, y se
// borran en cuanto la placa los consulta por polling (GET /comando-pendiente).
// Si el backend se reinicia, se pierden los pendientes sin consumir - es
// un trade-off aceptable para este alcance (no es información crítica que
// necesite sobrevivir un reinicio del servidor).
const comandosPendientes = new Map(); // dispositivoId -> { duracionSegundos }

// Activa el riego manualmente: emite el comando por socket (para que la
// app lo refleje en tiempo real) Y lo deja guardado en memoria (para que
// el firmware, que no puede escuchar sockets, lo recoja por polling).
async function activarRiego(req, res) {
  try {
    const { dispositivoId, duracionSegundos = 10 } = req.body;

    if (!dispositivoId) {
      return res.status(400).json({ error: 'dispositivoId es requerido' });
    }

    comandosPendientes.set(dispositivoId, { duracionSegundos });

    req.app.get('io').emit('comando_riego', { dispositivoId, duracionSegundos });

    res.json({ ok: true, mensaje: 'Comando de riego enviado', dispositivoId, duracionSegundos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// El firmware llama esto cada pocos segundos (polling) preguntando si
// hay un riego manual pendiente para él. Si lo hay, se lo devuelve UNA
// sola vez y lo borra del mapa (para no regarlo dos veces por la misma
// orden si la placa pregunta de nuevo antes del próximo comando).
function consultarComandoPendiente(req, res) {
  const { dispositivoId } = req.params;
  const comando = comandosPendientes.get(dispositivoId);

  if (!comando) {
    return res.json({ pendiente: false });
  }

  comandosPendientes.delete(dispositivoId);
  res.json({ pendiente: true, duracionSegundos: comando.duracionSegundos });
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

module.exports = {
  activarRiego,
  consultarComandoPendiente,
  registrarEvento,
  obtenerHistorial,
};