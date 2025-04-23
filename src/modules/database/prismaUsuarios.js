// src/modules/database/prismaUsuarios.js
const { PrismaClient } = require('@prisma/client');

let prismaUsuarios;

if (process.env.NODE_ENV === 'production') {
  prismaUsuarios = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_USUARIOS
      }
    }
  });
} else {
  if (!global.prismaUsuarios) {
    global.prismaUsuarios = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_USUARIOS
        }
      }
    });
  }
  prismaUsuarios = global.prismaUsuarios;
}

module.exports = prismaUsuarios;