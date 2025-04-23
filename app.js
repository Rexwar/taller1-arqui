// app.js
const { config } = require("dotenv");
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// Cargar variables de entorno solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  config({path: ".env"});
}

// Importar rutas
const authRoutes = require('./src/modules/autenticacion/authRoutes');
const usersRoutes = require('./src/modules/usuarios/usersRoutes');
const seederRoutes = require('./src/modules/database/seederRoutes');
// const facturasRoutes = require('./src/modules/facturas/facturasRoutes');
// const videosRoutes = require('./src/modules/videos/videosRoutes');

const app = express();

/* Middlewares */
// Configurar CORS más seguro
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://taller1-arqui.onrender.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Configurar morgan según el entorno
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

/* Middleware de seguridad básica */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

/* Rutas */
// Ruta de health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "StreamFlow API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Rutas principales
app.use('/auth', authRoutes);
app.use('/usuarios', usersRoutes);
// app.use('/facturas', facturasRoutes);
// app.use('/videos', videosRoutes);

// Rutas del seeder solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use('/database', seederRoutes);
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: process.env.NODE_ENV === 'production' 
      ? "Error interno del servidor" 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 StreamFlow API');
  console.log('=================================');
  console.log(`- Puerto:          ${PORT}`);
  console.log(`- Entorno:         ${process.env.NODE_ENV}`);
  console.log(`- URL:             ${process.env.NODE_ENV === 'production' 
    ? 'https://tu-api-domain.com' 
    : `http://localhost:${PORT}`}`);
  console.log('=================================');
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Promesa rechazada no manejada:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;