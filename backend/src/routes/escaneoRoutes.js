const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const escaneoController = require('../controllers/escaneoController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});

// Multer va ANTES que authMiddleware para que procese el multipart correctamente
router.post('/parametros', authMiddleware, escaneoController.obtenerParametros);
router.post('/', upload.single('foto'), authMiddleware, escaneoController.escanearPlanta);

module.exports = router;