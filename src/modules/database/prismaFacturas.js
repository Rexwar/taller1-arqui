const { PrismaClient } = require('../../../prisma/facturas/generated');
const prismaFacturas = globalThis.prismaFacturas || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaFacturas = prismaFacturas;
}

module.exports = prismaFacturas;
