// src/modules/autenticacion/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('./authController');
const authenticateToken = require('../../middleware/authenticateToken');

// Login - POST /auth/login
router.post('/login', authController.login);

// Actualizar contraseña - PATCH /auth/usuarios/:id
router.patch('/usuarios/:id', authenticateToken, authController.updatePassword);

module.exports = router;