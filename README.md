#StreamFlow API
API de gestión de usuarios y autenticación para plataformas de streaming.

URL Base: https://streamflow-api.onrender.com

Endpoints Principales
Autenticación:

POST /api/auth/login
POST /api/auth/register
Usuarios:

GET /api/users (admin)
GET /api/users/{id}
PUT /api/users/{id}
DELETE /api/users/{id}
Pruebas
Importar la colección de Postman proporcionada para probar todos los endpoints.

Variables de entorno Postman:

BASE_URL: https://streamflow-api.onrender.com
Cuenta Admin de Prueba
Email: admin@streamflow.com
Password: admin123

Notas
Usar Bearer Token para autenticación
La API está desplegada en Render
Los datos se reinician periódicamente

# Herramientas
- [DBDiagram](https://dbdiagram.io/home): Herramienta para diseñar diagramas de bases de datos.
- [Postman](https://www.postman.com/): Herramienta para probar APIs.
- [MongoDB Compass](https://www.mongodb.com/try/download/compass): Cliente de MongoDB con interfaz gráfica.

# Librerías de Node
- [Express](https://expressjs.com/): Framework para crear aplicaciones web en Node.js.
- [Morgan](https://www.npmjs.com/package/morgan): Middleware para loggear las peticiones HTTP.
- [Nodemon](https://www.npmjs.com/package/nodemon): Herramienta que reinicia el servidor automáticamente al detectar cambios en los archivos.
- [Mongoose](https://mongoosejs.com/): Librería para interactuar con bases de datos MongoDB.
- [Prisma](https://www.prisma.io/): ORM para bases de datos SQL y NoSQL.
- [Dotenv](https://www.npmjs.com/package/dotenv): Librería para cargar variables de entorno desde un archivo `.env`.
- [bcrypt](https://www.npmjs.com/package/bcrypt): Librería para encriptar contraseñas.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): Librería para generar y verificar tokens JWT.

# Recursos
- [Repositorio de curso de express con MongoDB](https://github.com/jonasschmedtmann/complete-node-bootcamp)
- [Conventional Commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13)