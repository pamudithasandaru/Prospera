const axios = require('axios');
const FormData = require('form-data');

exports.predictPlantDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

    const response = await axios.post(`${mlUrl}/api/predict`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      timeout: 30000,
    });

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    const details = error.response?.data || error.message;

    // If ML service is not running, return a helpful message
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      return res.status(503).json({
        success: false,
        message: 'ML service is not running. Please start the Python ML service on port 8000.',
        details,
      });
    }

    return res.status(502).json({
      success: false,
      message: 'ML service request failed',
      details,
    });
  }
};
