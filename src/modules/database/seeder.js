// src/database/seeder.js
const { faker } = require('@faker-js/faker');
const prismaUsuarios = require('./prismaUsuarios');
const prismaAuth = require('./prismaAuth');
const bcrypt = require('bcrypt');

faker.locale = 'es';

const cleanup = async () => {
    try {
        console.log('🧹 Limpiando bases de datos...');
        
        // Limpiar tablas
        await prismaAuth.authUsuario.deleteMany({});
        console.log('✓ Tabla auth_usuarios limpiada');
        
        await prismaUsuarios.user.deleteMany({});
        console.log('✓ Tabla usuarios limpiada');
        
        console.log('✅ Limpieza completada');
        return { success: true, message: 'Limpieza completada exitosamente' };
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        throw error;
    }
};

const generateRandomUser = (isDeployment) => {
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

    const createdUsers = [];

    for (const userData of testUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        try {
            const user = await prismaUsuarios.user.create({
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
            createdUsers.push(user);
        } catch (error) {
            if (error.code === 'P2002') {
                console.log('ℹ️ El usuario de prueba ya existe:', userData.email);
            } else {
                throw error;
            }
        }
    }

    return createdUsers;
};

const seed = async (isDeployment = false, shouldCleanup = false) => {
    try {
        console.log('🌱 Iniciando proceso de seeding...');
        console.log('Modo:', isDeployment ? 'Despliegue' : 'Desarrollo');

        if (shouldCleanup) {
            await cleanup();
        }

        // Crear usuarios principales
        const adminUser = await createAdminUser();
        let testUsers = [];
        if (isDeployment) {
            testUsers = await createTestUsers();
        }

        // Generar usuarios regulares
        const numUsers = isDeployment ? 10 : faker.number.int({ min: 100, max: 200 });
        console.log(`\nGenerando ${numUsers} usuarios aleatorios...`);

        const createdUsers = [];
        const batchSize = 10;
        
        for (let i = 0; i < numUsers; i += batchSize) {
            const batch = [];
            for (let j = 0; j < batchSize && (i + j) < numUsers; j++) {
                const userData = generateRandomUser(isDeployment);
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
            const batchResults = await Promise.all(batch.map(fn => fn()));
            createdUsers.push(...batchResults);
            console.log(`✓ Procesados ${Math.min(i + batchSize, numUsers)} de ${numUsers} usuarios`);
        }

        const summary = {
            success: true,
            totalUsers: numUsers + (adminUser ? 1 : 0) + testUsers.length,
            adminUser: adminUser ? {
                email: 'admin@streamflow.com',
                password: 'Admin123!'
            } : null,
            testUsers: isDeployment ? [
                { email: 'cliente@streamflow.com', password: 'Cliente123!' },
                { email: 'admin2@streamflow.com', password: 'Admin456!' }
            ] : [],
            regularUsers: createdUsers.length
        };

        console.log('\n✅ Seeding completado exitosamente!');
        console.log('\n📊 Resumen:', summary);

        return summary;

    } catch (error) {
        console.error('\n❌ Error durante el seeding:', error);
        console.error(error.stack);
        throw error;
    } finally {
        await prismaUsuarios.$disconnect();
        await prismaAuth.$disconnect();
    }
};

// Exportar las funciones para uso en API
module.exports = {
    seed,
    cleanup
};