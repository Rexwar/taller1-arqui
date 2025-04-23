// src/modules/database/prismaAuth.js
const { PrismaClient } = require('@prisma/client');

let prismaAuth;

if (process.env.NODE_ENV === 'production') {
  prismaAuth = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_AUTH
      }
    }
  });
} else {
  if (!global.prismaAuth) {
    global.prismaAuth = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_AUTH
        }
      }
    });
  }
  prismaAuth = global.prismaAuth;
}

module.exports = prismaAuth;