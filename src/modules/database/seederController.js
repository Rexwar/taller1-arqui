// src/modules/database/seederController.js
const seeder = require('./seeder');

const runSeeder = async (req, res) => {
    try {
        const isDeployment = req.query.mode === 'deploy';
        const shouldCleanup = req.query.cleanup === 'true';

        await seeder.seed(isDeployment, shouldCleanup);

        res.status(200).json({
            status: 'success',
            message: 'Seeding completado exitosamente'
        });
    } catch (error) {
        console.error('Error en seeder:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error durante el proceso de seeding',
            error: error.message
        });
    }
};

const runCleanup = async (req, res) => {
    try {
        await seeder.cleanup();
        res.status(200).json({
            status: 'success',
            message: 'Limpieza completada exitosamente'
        });
    } catch (error) {
        console.error('Error en cleanup:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error durante el proceso de limpieza',
            error: error.message
        });
    }
};

module.exports = {
    runSeeder,
    runCleanup
};