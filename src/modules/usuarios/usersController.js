// src/modules/usuarios/usersController.js
const { PrismaClient: UserPrismaClient } = require('../../../prisma/usuarios/generated');
const { PrismaClient: AuthPrismaClient } = require('../../../prisma/auth/generated');
const bcrypt = require('bcrypt');
const catchAsync = require('../../utils/catchAsync');

const userPrisma = new UserPrismaClient();
const authPrisma = new AuthPrismaClient();

// Crear usuario (POST /usuarios)
const createUser = catchAsync(async (req, res) => {
    const { nombre, apellido, email, password, confirmPassword, rol } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!nombre || !apellido || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    // Validar rol
    if (!['Administrador', 'Cliente'].includes(rol)) {
        return res.status(400).json({ message: 'Rol inválido' });
    }

    // Si se intenta crear un admin, verificar que quien lo crea sea admin
    if (rol === 'Administrador') {
        if (!req.user || req.user.rol !== 'Administrador') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden crear otros administradores' 
            });
        }
    }

    // Verificar si el email ya existe
    const existingUser = await userPrisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Crear usuario
    const user = await userPrisma.user.create({
        data: {
            nombre,
            apellido,
            email,
            rol: rol || 'Cliente'
        }
    });

    // Crear credenciales en auth
    const hashedPassword = await bcrypt.hash(password, 10);
    await authPrisma.authUsuario.create({
        data: {
            usuario_email: email,
            password_hash: hashedPassword
        }
    });

    // Devolver respuesta sin password
    res.status(201).json({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        creado_En: user.creado_En
    });
});

// Obtener usuario por ID (GET /usuarios/:id)
const getUserById = catchAsync(async (req, res) => {
    const { id } = req.params;

    // Verificar que el usuario existe
    const user = await userPrisma.user.findFirst({
        where: {
            id: parseInt(id),
            eliminado: false
        }
    });

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar permisos
    if (req.user.rol !== 'Administrador' && req.user.userId !== parseInt(id)) {
        return res.status(403).json({ message: 'No autorizado' });
    }

    res.json(user);
});

// Actualizar usuario (PATCH /usuarios/:id)
const updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email } = req.body;

    // Verificar que el usuario existe
    const user = await userPrisma.user.findFirst({
        where: {
            id: parseInt(id),
            eliminado: false
        }
    });

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar permisos
    if (req.user.userId !== parseInt(id)) {
        return res.status(403).json({ message: 'No autorizado' });
    }

    // Si se intenta modificar la contraseña
    if (req.body.password) {
        return res.status(400).json({ 
            message: 'La contraseña no puede ser modificada aquí. Use el endpoint de actualización de contraseña' 
        });
    }

    // Actualizar usuario
    const updatedUser = await userPrisma.user.update({
        where: { id: parseInt(id) },
        data: {
            nombre: nombre || user.nombre,
            apellido: apellido || user.apellido,
            email: email || user.email
        }
    });

    res.json(updatedUser);
});

// Eliminar usuario (DELETE /usuarios/:id)
const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    // Verificar que sea admin
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'Solo los administradores pueden eliminar usuarios' });
    }

    // Verificar que el usuario existe
    const user = await userPrisma.user.findFirst({
        where: {
            id: parseInt(id),
            eliminado: false
        }
    });

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Soft delete
    await userPrisma.user.update({
        where: { id: parseInt(id) },
        data: { eliminado: true }
    });

    res.status(204).send();
});

// Listar usuarios (GET /usuarios)
const listUsers = catchAsync(async (req, res) => {
    // Verificar que sea admin
    if (req.user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'Solo los administradores pueden listar usuarios' });
    }

    const { email, nombre } = req.query;

    // Construir filtros
    const where = {
        eliminado: false,
        ...(email && {
            email: {
                contains: email
            }
        }),
        ...(nombre && {
            OR: [
                {
                    nombre: {
                        contains: nombre
                    }
                },
                {
                    apellido: {
                        contains: nombre
                    }
                }
            ]
        })
    };

    // Obtener usuarios
    const users = await userPrisma.user.findMany({
        where,
        select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
            creado_En: true
        }
    });

    res.json(users);
});

module.exports = {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    listUsers
};