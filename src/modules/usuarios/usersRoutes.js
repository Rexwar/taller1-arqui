const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('./usersController');

// Rutas para el módulo Usuarios

// POST   /usuarios         -> Crear un nuevo usuario
router.post('/', createUser);

// GET    /usuarios         -> Listar todos los usuarios (con filtros opcionales)
router.get('/', getUsers);

// GET    /usuarios/:id     -> Obtener un usuario por ID
router.get('/:id', getUserById);

// PATCH  /usuarios/:id     -> Actualizar un usuario existente
router.patch('/:id', updateUser);

// DELETE /usuarios/:id     -> Eliminar (soft delete) un usuario
router.delete('/:id', deleteUser);

module.exports = router;