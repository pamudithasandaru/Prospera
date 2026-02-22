const express = require('express');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { predictPlantDisease } = require('../controllers/predictionController');

const router = express.Router();

// Real ML-powered plant disease prediction (proxies to Python FastAPI service)
router.post('/disease-detection', authenticate, upload.single('file'), predictPlantDisease);

module.exports = router;
