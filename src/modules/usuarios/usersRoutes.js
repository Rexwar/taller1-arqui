// src/modules/usuarios/usersRoutes.js
const express = require('express');
const router = express.Router();
const {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    listUsers
} = require('./usersController');
const authenticateToken = require('../../middleware/authenticateToken');

// Rutas públicas
router.post('/', createUser); // Crear usuario no requiere autenticación

// Rutas protegidas
router.get('/', authenticateToken, listUsers);
router.get('/:id', authenticateToken, getUserById);
router.patch('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;