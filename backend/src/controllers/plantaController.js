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
      dispositivoId,
      enMonitoreo,
    } = req.body;

    if (!nombreComun || !nombreCientifico) {
      return res.status(400).json({ error: 'nombreComun y nombreCientifico son requeridos' });
    }

    const planta = await Planta.create({
      usuarioId: req.usuarioId,
      nombreComun,
      nombreCientifico,
      fotoUri: fotoUri || null,
      luzIdeal: luzIdeal || null,
      temperaturaIdeal: temperaturaIdeal || null,
      umbralHumedadMinimo: umbralHumedadMinimo || 30,
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
    const planta = await Planta.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      req.body,
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
    const planta = await Planta.findOne({ dispositivoId });
    if (!planta) return res.status(404).json({ error: 'Dispositivo no vinculado a ninguna planta' });
    res.json({ umbralHumedadMinimo: planta.umbralHumedadMinimo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearPlanta,
  obtenerPlantas,
  obtenerPlanta,
  actualizarPlanta,
  eliminarPlanta,
  obtenerUmbralPorDispositivo,
};