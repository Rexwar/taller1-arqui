const prisma = require('../database/prismaUsuarios');
const catchAsync = require('../../utils/catchAsync');
const bcrypt = require('bcrypt');

// Helper to remove password field from user objects
function cleanUser(user) {
  const { password, ...clean } = user;
  return clean;
}

// Crear usuario
const createUser = catchAsync(async (req, res, next) => {
  const { nombre, apellido, email, password, rol } = req.body;

  // Validar rol
  if (!['Administrador', 'Cliente'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  // Verificar si el correo ya existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Correo ya registrado' });
  }

  // Hashear contraseña
  const hash = await bcrypt.hash(password, 10);

  // Crear usuario
  const newUser = await prisma.user.create({
    data: {
      nombre,
      apellido,
      email,
      password_hash: hash,
      rol,
    },
  });

  res.status(201).json(cleanUser(newUser));
});

// Obtener todos los usuarios (filtros opcionales)
const getUsers = catchAsync(async (req, res, next) => {
  const { nombre, email } = req.query;

  // esta consulta valida si el usuario está eliminado o no
  const users = await prisma.user.findMany({
    where: {
      eliminado: false,
      AND: [
        nombre
          ? {
              OR: [
                { nombre: { contains: nombre, mode: 'insensitive' } },
                { apellido: { contains: nombre, mode: 'insensitive' } },
              ],
            }
          : {},
        email
          ? { email: { contains: email, mode: 'insensitive' } }
          : {},
      ],
    },
  });

  res.status(200).json(users.map(cleanUser));
});

// Obtener usuario por ID
const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user || user.eliminado) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.status(200).json(cleanUser(user));
});

// Actualizar usuario
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { nombre, apellido, email } = req.body;

  // Verificar existencia
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user || user.eliminado) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // Actualizar campos permitidos
  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { nombre, apellido, email },
  });

  res.status(200).json(cleanUser(updated));
});

// Eliminar usuario (soft delete)
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user || user.eliminado) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data: { eliminado: true },
  });

  res.status(204).send();
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
