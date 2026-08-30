const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'suwa_secret_dev';
const JWT_EXPIRES = '7d';

const CodigoRecuperacion = require('../models/CodigoRecuperacion');
const { generarCodigo, enviarCodigoRecuperacion } = require('../services/emailService');

async function registro(req, res) {
  try {
    const { nombre, apellidos, correoOTelefono, contrasena } = req.body;

    if (!nombre || !apellidos || !correoOTelefono || !contrasena) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existe = await Usuario.findOne({ correoOTelefono });
    if (existe) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo o teléfono' });
    }

    const passwordHash = await bcrypt.hash(contrasena, 10);

    const usuario = await Usuario.create({
      nombre,
      apellidos,
      correoOTelefono,
      passwordHash,
    });

    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correoOTelefono: usuario.correoOTelefono,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { correoOTelefono, contrasena } = req.body;

    if (!correoOTelefono || !contrasena) {
      return res.status(400).json({ error: 'Correo/teléfono y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ correoOTelefono });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.passwordHash);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correoOTelefono: usuario.correoOTelefono,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function cambiarContrasena(req, res) {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (contrasenaNueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const usuario = await Usuario.findById(req.usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contrasenaActual, usuario.passwordHash);
    if (!esValida) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    usuario.passwordHash = await bcrypt.hash(contrasenaNueva, 10);
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function olvidoContrasena(req, res) {
  try {
    const { correoOTelefono } = req.body;

    if (!correoOTelefono) {
      return res.status(400).json({ error: 'El correo es requerido' });
    }

    const usuario = await Usuario.findOne({ correoOTelefono });
    if (!usuario) {
      return res.status(404).json({ error: 'No existe una cuenta con ese correo' });
    }

    // Invalida códigos anteriores
    await CodigoRecuperacion.updateMany(
      { correoOTelefono, usado: false },
      { usado: true }
    );

    const codigo = generarCodigo();
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await CodigoRecuperacion.create({ correoOTelefono, codigo, expiraEn });
    await enviarCodigoRecuperacion(correoOTelefono, codigo);

    res.json({ mensaje: 'Código enviado al correo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function verificarCodigo(req, res) {
  try {
    const { correoOTelefono, codigo } = req.body;

    const registro = await CodigoRecuperacion.findOne({
      correoOTelefono,
      codigo,
      usado: false,
      expiraEn: { $gt: new Date() },
    });

    if (!registro) {
      return res.status(400).json({ error: 'Código incorrecto o expirado' });
    }

    res.json({ mensaje: 'Código válido', valido: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function nuevaContrasena(req, res) {
  try {
    const { correoOTelefono, codigo, contrasenaNueva } = req.body;

    if (!contrasenaNueva || contrasenaNueva.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const registro = await CodigoRecuperacion.findOne({
      correoOTelefono,
      codigo,
      usado: false,
      expiraEn: { $gt: new Date() },
    });

    if (!registro) {
      return res.status(400).json({ error: 'Código incorrecto o expirado' });
    }

    const passwordHash = await bcrypt.hash(contrasenaNueva, 10);
    await Usuario.findOneAndUpdate({ correoOTelefono }, { passwordHash });
    await CodigoRecuperacion.findByIdAndUpdate(registro._id, { usado: true });

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { registro, login, cambiarContrasena, olvidoContrasena, verificarCodigo, nuevaContrasena };