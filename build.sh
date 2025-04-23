#!/bin/bash
# build.sh
npm install
npx prisma generate --schema=./prisma/auth/schema.prisma
npx prisma generate --schema=./prisma/usuarios/schema.prisma
mkdir -p ./node_modules/.prisma/client/
cp -r ./prisma/auth/generated/* ./node_modules/.prisma/client/
cp -r ./prisma/usuarios/generated/* ./node_modules/.prisma/client/