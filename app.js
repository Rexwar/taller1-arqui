// app.js
const { config } = require("dotenv");
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// Cargar variables de entorno
config({path: ".env"});

// Importar rutas
const authRoutes = require('./src/modules/autenticacion/authRoutes');
const usersRoutes = require('./src/modules/usuarios/usersRoutes');
// const facturasRoutes = require('./src/modules/facturas/facturasRoutes');
// const videosRoutes = require('./src/modules/videos/videosRoutes');

const app = express();

/* Middlewares */
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

/* Rutas */
// Asegúrate de que las rutas estén definidas correctamente
app.use('/auth', authRoutes);
app.use('/usuarios', usersRoutes);
// app.use('/facturas', facturasRoutes);
// app.use('/videos', videosRoutes);

// Ruta de health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "StreamFlow API is running"
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
});
// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 StreamFlow API');
  console.log('=================================');
  console.log(`- Puerto:          ${PORT}`);
  console.log(`- Entorno:         ${process.env.NODE_ENV}`);
  console.log(`- URL:             http://localhost:${PORT}/`);
  console.log('=================================');
});

//module.exports = app;