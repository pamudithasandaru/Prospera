// API Response formatter
class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  }

  static paginated(res, data, page, limit, total) {
    return res.json({
      success: true,
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        pageSize: parseInt(limit),
        totalItems: total
      }
    });
  }
}

// Error handler
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate random string
const generateRandomString = (length = 32) => {
  return require('crypto').randomBytes(length).toString('hex');
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Validate Sri Lankan phone number
const validateSriLankanPhone = (phone) => {
  const phoneRegex = /^(?:\+94|0)?[1-9]\d{8}$/;
  return phoneRegex.test(phone);
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

module.exports = {
  ApiResponse,
  ErrorResponse,
  asyncHandler,
  generateRandomString,
  formatDate,
  calculateDistance,
  validateSriLankanPhone,
  sanitizeInput
};
