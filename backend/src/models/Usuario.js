const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  correoOTelefono: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Usuario', usuarioSchema);