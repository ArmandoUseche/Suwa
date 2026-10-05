const Planta = require('../models/Planta');

async function crearPlanta(req, res) {
  try {
    const {
      nombreComun,
      nombreCientifico,
      fotoUri,
      luzIdeal,
      temperaturaIdeal,
      umbralHumedadMinimo,
      pulsoRiegoSegundos,
      pausaAbsorcionSegundos,
      maxPulsosRiego,
      tiempoMaximoRiegoSegundos,
      dispositivoId,
      enMonitoreo,
    } = req.body;

    if (!nombreComun || !nombreCientifico) {
      return res.status(400).json({ error: 'nombreComun y nombreCientifico son requeridos' });
    }

    if (
      umbralHumedadMinimo !== undefined
      && (!Number.isFinite(Number(umbralHumedadMinimo))
        || Number(umbralHumedadMinimo) < 0
        || Number(umbralHumedadMinimo) > 100)
    ) {
      return res.status(400).json({ error: 'umbralHumedadMinimo debe estar entre 0 y 100' });
    }

    const parametrosRiego = [
      ['pulsoRiegoSegundos', pulsoRiegoSegundos, 1, 10],
      ['pausaAbsorcionSegundos', pausaAbsorcionSegundos, 10, 120],
      ['maxPulsosRiego', maxPulsosRiego, 1, 10],
      ['tiempoMaximoRiegoSegundos', tiempoMaximoRiegoSegundos, 1, 120],
    ];
    for (const [nombre, valor, minimo, maximo] of parametrosRiego) {
      if (
        valor !== undefined
        && (!Number.isInteger(Number(valor)) || Number(valor) < minimo || Number(valor) > maximo)
      ) {
        return res.status(400).json({
          error: `${nombre} debe ser un número entero entre ${minimo} y ${maximo}`,
        });
      }
    }

    if (enMonitoreo && dispositivoId) {
      await Planta.updateMany(
        { usuarioId: req.usuarioId, dispositivoId, enMonitoreo: true },
        { $set: { enMonitoreo: false } }
      );
    }

    const planta = await Planta.create({
      usuarioId: req.usuarioId,
      nombreComun,
      nombreCientifico,
      fotoUri: fotoUri || null,
      luzIdeal: luzIdeal || null,
      temperaturaIdeal: temperaturaIdeal || null,
      umbralHumedadMinimo: umbralHumedadMinimo ?? 30,
      pulsoRiegoSegundos: pulsoRiegoSegundos ?? 3,
      pausaAbsorcionSegundos: pausaAbsorcionSegundos ?? 20,
      maxPulsosRiego: maxPulsosRiego ?? 3,
      tiempoMaximoRiegoSegundos: tiempoMaximoRiegoSegundos ?? 90,
      dispositivoId: dispositivoId || null,
      enMonitoreo: Boolean(enMonitoreo && dispositivoId),
    });

    res.status(201).json(planta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerPlantas(req, res) {
  try {
    const plantas = await Planta.find({ usuarioId: req.usuarioId }).sort({ createdAt: -1 });
    res.json(plantas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtenerPlanta(req, res) {
  try {
    const planta = await Planta.findOne({ _id: req.params.id, usuarioId: req.usuarioId });
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' });
    res.json(planta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizarPlanta(req, res) {
  try {
    const {
      enMonitoreo,
      dispositivoId,
      umbralHumedadMinimo,
      temperaturaIdeal,
      luzIdeal,
      pulsoRiegoSegundos,
      pausaAbsorcionSegundos,
      maxPulsosRiego,
      tiempoMaximoRiegoSegundos,
    } = req.body;
    const camposPermitidos = {
      umbralHumedadMinimo,
      temperaturaIdeal,
      luzIdeal,
      pulsoRiegoSegundos,
      pausaAbsorcionSegundos,
      maxPulsosRiego,
      tiempoMaximoRiegoSegundos,
      enMonitoreo,
      dispositivoId,
    };
    const cambios = Object.fromEntries(
      Object.entries(camposPermitidos).filter(([, valor]) => valor !== undefined)
    );

    if (
      umbralHumedadMinimo !== undefined
      && (!Number.isFinite(Number(umbralHumedadMinimo))
        || Number(umbralHumedadMinimo) < 0
        || Number(umbralHumedadMinimo) > 100)
    ) {
      return res.status(400).json({ error: 'umbralHumedadMinimo debe estar entre 0 y 100' });
    }

    if (
      temperaturaIdeal !== undefined
      && temperaturaIdeal !== null
      && !Number.isFinite(Number(temperaturaIdeal))
    ) {
      return res.status(400).json({ error: 'temperaturaIdeal debe ser un número válido' });
    }

    const parametrosRiego = [
      ['pulsoRiegoSegundos', pulsoRiegoSegundos, 1, 10],
      ['pausaAbsorcionSegundos', pausaAbsorcionSegundos, 10, 120],
      ['maxPulsosRiego', maxPulsosRiego, 1, 10],
      ['tiempoMaximoRiegoSegundos', tiempoMaximoRiegoSegundos, 1, 120],
    ];
    for (const [nombre, valor, minimo, maximo] of parametrosRiego) {
      if (
        valor !== undefined
        && (!Number.isInteger(Number(valor)) || Number(valor) < minimo || Number(valor) > maximo)
      ) {
        return res.status(400).json({
          error: `${nombre} debe ser un número entero entre ${minimo} y ${maximo}`,
        });
      }
    }

    if (enMonitoreo && dispositivoId) {
      await Planta.updateMany(
        {
          usuarioId: req.usuarioId,
          dispositivoId,
          _id: { $ne: req.params.id },
          enMonitoreo: true,
        },
        { $set: { enMonitoreo: false } }
      );
    }

    const planta = await Planta.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      cambios,
      { new: true, runValidators: true }
    );
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' });
    res.json(planta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function subirFoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    const fotoUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const planta = await Planta.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      { fotoUri },
      { new: true }
    );
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' });
    res.json(planta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function eliminarPlanta(req, res) {
  try {
    const planta = await Planta.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.usuarioId,
    });
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' });
    res.json({ mensaje: 'Planta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Sin autenticación: el firmware (Arduino) no puede manejar JWT fácilmente,
// así que este endpoint solo expone el umbral de humedad, nada sensible.
async function obtenerUmbralPorDispositivo(req, res) {
  try {
    const { dispositivoId } = req.params;
    const planta = await Planta.findOne({ dispositivoId, enMonitoreo: true });
    if (!planta) return res.status(404).json({ error: 'Dispositivo no vinculado a ninguna planta' });
    res.json({
      umbralHumedadMinimo: planta.umbralHumedadMinimo,
      pulsoRiegoSegundos: planta.pulsoRiegoSegundos,
      pausaAbsorcionSegundos: planta.pausaAbsorcionSegundos,
      maxPulsosRiego: planta.maxPulsosRiego,
      tiempoMaximoRiegoSegundos: planta.tiempoMaximoRiegoSegundos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearPlanta,
  obtenerPlantas,
  obtenerPlanta,
  actualizarPlanta,
  subirFoto,
  eliminarPlanta,
  obtenerUmbralPorDispositivo,
};