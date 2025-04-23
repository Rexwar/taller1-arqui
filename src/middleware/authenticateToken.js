// src/middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'No se proporcionó token de autenticación'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Formato de token inválido'
            });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Token inválido o expirado'
                });
            }

            // Agregar información del usuario al request
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                rol: decoded.rol
            };
            
            next();
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al verificar el token'
        });
    }
};

module.exports = authenticateToken;