const mongoose = require('mongoose');

const codigoRecuperacionSchema = new mongoose.Schema({
  correoOTelefono: { type: String, required: true },
  codigo: { type: String, required: true },
  expiraEn: { type: Date, required: true },
  usado: { type: Boolean, default: false },
});

module.exports = mongoose.model('CodigoRecuperacion', codigoRecuperacionSchema);