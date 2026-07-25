const mongoose = require('mongoose');

const lecturaSensorSchema = new mongoose.Schema({
  humedadSuelo: { type: Number, required: true }, // %
  temperatura: { type: Number, required: true },  // °C
  humedadAmbiente: { type: Number, required: true }, // %
  dispositivoId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LecturaSensor', lecturaSensorSchema);
