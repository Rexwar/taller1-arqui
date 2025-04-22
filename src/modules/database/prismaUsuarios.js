const { PrismaClient } = require('../../../prisma/usuarios/generated');
const prismaUsuarios = globalThis.prismaUsuarios || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaUsuarios = prismaUsuarios;
}

module.exports = prismaUsuarios;
