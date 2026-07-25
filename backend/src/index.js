require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const sensorRoutes = require('./routes/sensorRoutes');
const riegoRoutes = require('./routes/riegoRoutes');
const alertaRoutes = require('./routes/alertaRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Hace disponible io en los controladores (req.app.get('io'))
app.set('io', io);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'suwa-backend' });
});

app.use('/api/sensores', sensorRoutes);
app.use('/api/riego', riegoRoutes);
app.use('/api/alertas', alertaRoutes);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`SUWA backend escuchando en el puerto ${PORT}`);
  });
});
