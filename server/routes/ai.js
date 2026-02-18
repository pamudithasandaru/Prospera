const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/disease-detection', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image is required' });
  }

  const sampleResult = {
    disease: {
      name: 'Leaf Blight',
      severity: 'medium',
      description: 'Fungal infection causing yellowing and brown lesions on leaves.',
      symptoms: [
        'Yellow spots on lower leaves',
        'Brown lesions spreading upwards',
        'Premature leaf drop',
      ],
    },
    confidence: 92,
    recommendations: [
      'Remove heavily affected leaves',
      'Apply copper-based fungicide in the evening',
      'Improve field drainage to reduce humidity',
      'Rotate crops to non-host species next season',
    ],
  };

  return res.json({ success: true, data: sampleResult });
});

module.exports = router;
