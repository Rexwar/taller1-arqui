// src/modules/autenticacion/authController.js
const prismaAuth = require('../database/prismaAuth');
const prismaUsuarios = require('../database/prismaUsuarios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const catchAsync = require('../../utils/catchAsync');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Validar que se proporcionaron email y password
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email y contraseña son requeridos' 
    });
  }

  // Verificar credenciales en auth_usuarios
  const authUser = await prismaAuth.authUsuario.findUnique({
    where: { 
      usuario_email: email
    }
  });

  if (!authUser) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Verificar si el usuario está eliminado
  const user = await prismaUsuarios.user.findUnique({
    where: { email }
  });

  if (!user || user.eliminado) {
    return res.status(401).json({ message: 'Usuario no encontrado o eliminado' });
  }

  // Verificar contraseña
  const validPassword = await bcrypt.compare(password, authUser.password_hash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  // Obtener datos del usuario
  const userData = await prismaUsuarios.user.findUnique({
    where: { email },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      rol: true,
      creado_En: true
    }
  });

  // Generar token JWT
  const token = jwt.sign(
    { 
      userId: userData.id,
      email: userData.email,
      rol: userData.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    usuario: userData
  });
});

const updatePassword = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validar que todos los campos necesarios estén presentes
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ 
      message: 'Todos los campos son requeridos' 
    });
  }

  // Verificar que el usuario está actualizando su propia contraseña
  if (req.user.userId !== parseInt(id)) {
    return res.status(403).json({ 
      message: 'No autorizado para cambiar la contraseña de otro usuario' 
    });
  }

  // Verificar que las nuevas contraseñas coinciden
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ 
      message: 'La nueva contraseña y su confirmación no coinciden' 
    });
  }

  // Verificar que la nueva contraseña sea diferente a la actual
  if (currentPassword === newPassword) {
    return res.status(400).json({ 
      message: 'La nueva contraseña debe ser diferente a la actual' 
    });
  }

  // Obtener usuario de auth
  const authUser = await prismaAuth.authUsuario.findUnique({
    where: { usuario_email: req.user.email }
  });

  if (!authUser) {
    return res.status(404).json({ 
      message: 'Usuario no encontrado' 
    });
  }

  // Verificar contraseña actual
  const validPassword = await bcrypt.compare(currentPassword, authUser.password_hash);
  if (!validPassword) {
    return res.status(401).json({ 
      message: 'La contraseña actual es incorrecta' 
    });
  }

  // Generar hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar contraseña
  await prismaAuth.authUsuario.update({
    where: { usuario_email: req.user.email },
    data: { password_hash: hashedPassword }
  });

  res.json({ 
    status: 'success',
    message: 'Contraseña actualizada exitosamente' 
  });
});

module.exports = {
  login,
  updatePassword
};