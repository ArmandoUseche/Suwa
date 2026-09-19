const EventoRiego = require('../models/EventoRiego');
const RiegoProgramado = require('../models/RiegoProgramado');

// Comandos de riego pendientes de que el firmware los recoja, en memoria
// (no en Mongo): se guardan acá cuando la app pide un riego manual, y se
// borran en cuanto la placa los consulta por polling (GET /comando-pendiente).
// Si el backend se reinicia, se pierden los pendientes sin consumir - es
// un trade-off aceptable para este alcance (no es información crítica que
// necesite sobrevivir un reinicio del servidor).
const comandosPendientes = new Map(); // dispositivoId -> { duracionSegundos }

function siguienteEjecucion(proximaEjecucion) {
  const siguiente = new Date(proximaEjecucion);
  siguiente.setUTCDate(siguiente.getUTCDate() + 1);
  return siguiente;
}

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
async function consultarComandoPendiente(req, res) {
  const { dispositivoId } = req.params;
  const comando = comandosPendientes.get(dispositivoId);

  if (comando) {
    comandosPendientes.delete(dispositivoId);
    return res.json({ pendiente: true, duracionSegundos: comando.duracionSegundos });
  }

  const programado = await RiegoProgramado.findOneAndUpdate(
    { dispositivoId, activo: true, comandoPendiente: true },
    { comandoPendiente: false },
    { new: true },
  );
  if (programado) {
    return res.json({
      pendiente: true,
      duracionSegundos: programado.duracionSegundos,
    });
  }
  res.json({ pendiente: false });
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

async function programarRiego(req, res) {
  try {
    const {
      dispositivoId,
      hora,
      minuto,
      duracionSegundos = 10,
      proximaEjecucion,
    } = req.body;

    if (
      !dispositivoId
      || !Number.isInteger(Number(hora))
      || !Number.isInteger(Number(minuto))
      || !proximaEjecucion
    ) {
      return res.status(400).json({
        error: 'dispositivoId, hora, minuto y proximaEjecucion son requeridos',
      });
    }

    const horaNumero = Number(hora);
    const minutoNumero = Number(minuto);
    const duracionNumero = Number(duracionSegundos);
    const fecha = new Date(proximaEjecucion);
    if (
      horaNumero < 0 || horaNumero > 23
      || minutoNumero < 0 || minutoNumero > 59
      || !Number.isFinite(duracionNumero) || duracionNumero < 1 || duracionNumero > 120
      || Number.isNaN(fecha.getTime())
    ) {
      return res.status(400).json({ error: 'Los datos del horario no son válidos' });
    }

    const programacion = await RiegoProgramado.findOneAndUpdate(
      { dispositivoId },
      {
        dispositivoId,
        hora: horaNumero,
        minuto: minutoNumero,
        duracionSegundos: duracionNumero,
        proximaEjecucion: fecha,
        activo: true,
        comandoPendiente: false,
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(programacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerProgramacion(req, res) {
  try {
    const programacion = await RiegoProgramado.findOne({
      dispositivoId: req.params.dispositivoId,
      activo: true,
    });
    res.json(programacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function cancelarProgramacion(req, res) {
  try {
    await RiegoProgramado.findOneAndUpdate(
      { dispositivoId: req.params.dispositivoId },
      { activo: false, comandoPendiente: false },
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function procesarRiegosProgramados() {
  const ahora = new Date();
  const programaciones = await RiegoProgramado.find({
    activo: true,
    proximaEjecucion: { $lte: ahora },
  });

  for (const programacion of programaciones) {
    const actualizada = await RiegoProgramado.findOneAndUpdate(
      {
        _id: programacion._id,
        activo: true,
        proximaEjecucion: programacion.proximaEjecucion,
      },
      {
        proximaEjecucion: siguienteEjecucion(programacion.proximaEjecucion),
        comandoPendiente: true,
      },
      { new: true },
    );
    if (!actualizada) continue;

    comandosPendientes.set(programacion.dispositivoId, {
      duracionSegundos: programacion.duracionSegundos,
    });
  }
}

module.exports = {
  activarRiego,
  consultarComandoPendiente,
  registrarEvento,
  obtenerHistorial,
  programarRiego,
  obtenerProgramacion,
  cancelarProgramacion,
  procesarRiegosProgramados,
};