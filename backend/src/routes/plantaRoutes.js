const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const plantaController = require('../controllers/plantaController');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Solo se permiten archivos de imagen'));
  },
});

// Sin token: la usa el firmware (Arduino no maneja JWT). Va antes del
// router.use(authMiddleware) a propósito, para que quede fuera de esa capa.
router.get('/dispositivo/:dispositivoId', plantaController.obtenerUmbralPorDispositivo);

// De aquí en adelante, todas las rutas requieren token
router.use(authMiddleware);

router.post('/', plantaController.crearPlanta);
router.get('/', plantaController.obtenerPlantas);
router.get('/:id', plantaController.obtenerPlanta);
router.post('/:id/foto', upload.single('foto'), plantaController.subirFoto);
router.patch('/:id', plantaController.actualizarPlanta);
router.delete('/:id', plantaController.eliminarPlanta);

module.exports = router;