const Alerta = require('../models/Alerta');

async function obtenerAlertas(req, res) {
  try {
    const { dispositivoId } = req.params;
    const alertas = await Alerta.find({ dispositivoId }).sort({ timestamp: -1 }).limit(100);
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function marcarLeida(req, res) {
  try {
    const { id } = req.params;
    const alerta = await Alerta.findByIdAndUpdate(id, { leida: true }, { new: true });

    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json(alerta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function marcarTodasLeidas(req, res) {
  try {
    const resultado = await Alerta.updateMany(
      { dispositivoId: req.params.dispositivoId, leida: false },
      { $set: { leida: true } }
    );
    res.json({ ok: true, modificadas: resultado.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { obtenerAlertas, marcarLeida, marcarTodasLeidas };
