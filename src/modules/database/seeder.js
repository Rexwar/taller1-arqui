// src/database/seeder.js
const { faker } = require('@faker-js/faker');
const prismaUsuarios = require('./prismaUsuarios');
const prismaAuth = require('./prismaAuth');
const bcrypt = require('bcrypt');

faker.locale = 'es';

// Verificar argumentos
const isDeployment = process.argv.includes('--deploy');
const shouldCleanup = process.argv.includes('--cleanup');

const cleanup = async () => {
    try {
        console.log('🧹 Limpiando bases de datos...');
        
        // Limpiar tablas
        await prismaAuth.authUsuario.deleteMany({});
        console.log('✓ Tabla auth_usuarios limpiada');
        
        await prismaUsuarios.user.deleteMany({});
        console.log('✓ Tabla usuarios limpiada');
        
        console.log('✅ Limpieza completada');
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        throw error;
    }
};

const generateRandomUser = () => {
    const roles = ['Cliente', 'Administrador'];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
        nombre: firstName,
        apellido: lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        rol: roles[Math.random() < 0.1 ? 1 : 0], // 10% probabilidad de ser admin
        password: isDeployment ? 'Password123!' : faker.internet.password({ length: 12, memorable: true })
    };
};

const createAdminUser = async () => {
    const adminData = {
        nombre: 'Admin',
        apellido: 'Principal',
        email: 'admin@streamflow.com',
        rol: 'Administrador',
        password: 'Admin123!'
    };

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    try {
        const admin = await prismaUsuarios.user.create({
            data: {
                nombre: adminData.nombre,
                apellido: adminData.apellido,
                email: adminData.email,
                rol: adminData.rol
            }
        });

        await prismaAuth.authUsuario.create({
            data: {
                usuario_email: adminData.email,
                password_hash: hashedPassword
            }
        });

        console.log('✓ Usuario administrador creado:', adminData.email);
        console.log('  Email:', adminData.email);
        console.log('  Contraseña:', adminData.password);
        return admin;
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('ℹ️ El usuario administrador ya existe');
        } else {
            throw error;
        }
    }
};

const createTestUsers = async () => {
    const testUsers = [
        {
            nombre: 'Cliente',
            apellido: 'Prueba',
            email: 'cliente@streamflow.com',
            rol: 'Cliente',
            password: 'Cliente123!'
        },
        {
            nombre: 'Admin',
            apellido: 'Secundario',
            email: 'admin2@streamflow.com',
            rol: 'Administrador',
            password: 'Admin456!'
        }
    ];

    for (const userData of testUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        try {
            await prismaUsuarios.user.create({
                data: {
                    nombre: userData.nombre,
                    apellido: userData.apellido,
                    email: userData.email,
                    rol: userData.rol
                }
            });

            await prismaAuth.authUsuario.create({
                data: {
                    usuario_email: userData.email,
                    password_hash: hashedPassword
                }
            });

            console.log('✓ Usuario de prueba creado:', userData.email);
            console.log('  Email:', userData.email);
            console.log('  Contraseña:', userData.password);
        } catch (error) {
            if (error.code === 'P2002') {
                console.log('ℹ️ El usuario de prueba ya existe:', userData.email);
            } else {
                throw error;
            }
        }
    }
};

const seed = async () => {
    try {
        console.log('🌱 Iniciando proceso de seeding...');
        console.log('Modo:', isDeployment ? 'Despliegue' : 'Desarrollo');

        if (shouldCleanup) {
            await cleanup();
        }

        // Crear usuarios principales
        await createAdminUser();
        if (isDeployment) {
            await createTestUsers();
        }

        // Generar usuarios regulares
        const numUsers = isDeployment ? 10 : faker.number.int({ min: 100, max: 200 });
        console.log(`\nGenerando ${numUsers} usuarios aleatorios...`);

        const batchSize = 10;
        for (let i = 0; i < numUsers; i += batchSize) {
            const batch = [];
            for (let j = 0; j < batchSize && (i + j) < numUsers; j++) {
                const userData = generateRandomUser();
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                batch.push(async () => {
                    // Crear usuario
                    const user = await prismaUsuarios.user.create({
                        data: {
                            nombre: userData.nombre,
                            apellido: userData.apellido,
                            email: userData.email,
                            rol: userData.rol
                        }
                    });

                    // Crear credenciales
                    await prismaAuth.authUsuario.create({
                        data: {
                            usuario_email: userData.email,
                            password_hash: hashedPassword
                        }
                    });

                    return user;
                });
            }

            // Ejecutar batch
            await Promise.all(batch.map(fn => fn()));
            console.log(`✓ Procesados ${Math.min(i + batchSize, numUsers)} de ${numUsers} usuarios`);
        }

        console.log('\n✅ Seeding completado exitosamente!');
        console.log('\n📊 Resumen:');
        console.log(`   - Usuarios creados: ${numUsers + 3} (incluye admin y usuarios de prueba)`);
        console.log('\n👤 Usuarios de prueba:');
        console.log('   - Admin Principal: admin@streamflow.com / Admin123!');
        if (isDeployment) {
            console.log('   - Admin Secundario: admin2@streamflow.com / Admin456!');
            console.log('   - Cliente Prueba: cliente@streamflow.com / Cliente123!');
        }

    } catch (error) {
        console.error('\n❌ Error durante el seeding:', error);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await prismaUsuarios.$disconnect();
        await prismaAuth.$disconnect();
    }
};

// Ejecutar el seeder
seed();