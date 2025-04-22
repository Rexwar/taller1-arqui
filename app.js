// index.js (o app.js)
const { config } = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const usersRouter = require("./src/modules/usuarios/usersRoutes");
// Importa tu instancia de Prisma para la DB de usuarios
const prismaUsers = require("./src/modules/database/prismaUsuarios");

config({ path: ".env" });

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use("/users", usersRouter);

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// Conéctate a la base de datos antes de escuchar
async function startServer() {
  try {
    await prismaUsers.$connect();
    console.log("✅ Conectado a la base de datos con Prisma");

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
      console.log(`   • Entorno: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
    process.exit(1);
  }
}

startServer();
