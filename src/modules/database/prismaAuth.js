// src/database/prismaAuth.js
const { PrismaClient } = require('@prisma/client');

const prismaAuth = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL_AUTH
});

module.exports = prismaAuth;