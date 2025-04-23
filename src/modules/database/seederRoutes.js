// src/modules/database/seederRoutes.js
const express = require('express');
const router = express.Router();
const { runSeeder, runCleanup } = require('./seederController');

router.post('/seed', runSeeder);
router.post('/cleanup', runCleanup);

module.exports = router;