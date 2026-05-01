# ML Models Documentation - Prospera System

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [ML Model Details](#ml-model-details)
4. [Data Flow](#data-flow)
5. [Backend Integration](#backend-integration)
6. [Frontend Integration](#frontend-integration)
7. [Environment Configuration](#environment-configuration)
8. [API Endpoints](#api-endpoints)
9. [Disease Classification](#disease-classification)
10. [Running the ML Services](#running-the-ml-services)
11. [Model Loading Strategies](#model-loading-strategies)

---

## Overview

**Prospera** uses a **plant disease detection ML model** to identify diseases in agricultural crops. The system employs an **ensemble Keras neural network** trained on plant leaf images to classify diseases into four categories:
- **Healthy**: No disease detected
- **Rust**: Fungal rust disease
- **Scab**: Fungal scab disease
- **Multiple_Diseases**: Multiple concurrent diseases

### Key Features
- **Model Type**: Deep Learning (TensorFlow/Keras CNN Ensemble)
- **Input**: Plant leaf images (512x512 RGB)
- **Output**: Disease prediction with confidence scores
- **Architecture**: Microservice-based (Python FastAPI + Node.js Express + React)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROSPERA ML SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   React Frontend     │
│  (DiseaseDetection   │
│   Component)         │
└──────────┬───────────┘
           │ HTTP POST /ml/predict
           │ (FormData with image)
           │
┌──────────▼──────────────────────┐
│   Node.js Express Backend        │
│  (Port 5000)                     │
│  - Authentication (JWT)          │
│  - File upload handling          │
│  - Proxies to ML service         │
│  - Routes: /api/ml/predict       │
└──────────┬──────────────────────┘
           │ Forward to Python Service
           │ HTTP POST /api/predict
           │
┌──────────▼────────────────────────────┐
│   Python FastAPI ML Service           │
│  (Port 8000 - ml-service)             │
│  - Model loading & inference          │
│  - Image preprocessing                │
│  - TensorFlow/Keras predictions       │
│  - Returns: {prediction, confidence}  │
└─────────────────────────────────────────┘
           │
           │ Response JSON
           │
    ┌──────▼──────┐
    │ Predictions │
    │ - Class     │
    │ - Confidence│
    │ - All Scores│
    └─────────────┘
```

### Components

1. **Frontend** (`client/src/pages/ai/DiseaseDetection.js`)
   - Image upload interface
   - File preview
   - Calls ML API via `mlApi.js` service

2. **Backend** (`server/`)
   - Express server (Node.js)
   - Proxies requests to Python ML service
   - Authentication & file upload handling
   - Route: `POST /api/ml/disease-detection`

3. **ML Service** (`ml-service/app.py`)
   - FastAPI server
   - Loads Keras model
   - Performs image preprocessing
   - Runs inference
   - Returns predictions

---

## ML Model Details

### Model Specifications

| Property | Value |
|----------|-------|
| **Framework** | TensorFlow 2.x with Keras |
| **Model Type** | Convolutional Neural Network (CNN) Ensemble |
| **File Format** | `.keras` (modern TensorFlow format) |
| **Input Shape** | (512, 512, 3) - RGB images at 512x512 resolution |
| **Output** | 4-class softmax probabilities |
| **Optimizer** | Adam |
| **Loss Function** | Categorical Cross-Entropy |
| **Metrics** | Accuracy |
| **Classes** | 4 (Healthy, Rust, Scab, Multiple_Diseases) |

### Model Storage Options

The system now uses **local model files only**. The ML service searches these locations in order:

1. `ml-service/models/plant_disease_model.keras`
2. `ml-service/plant_disease_model.keras`

If neither file exists, the service starts but the model load fails and predictions return `Model not loaded`.

### Model Architecture (Ensemble)

```
Input Layer (512x512 RGB Image)
         │
         ▼
Image Preprocessing
  - Normalization: pixel values / 255.0
  - Resize: 512x512
  - Expand dims: (1, 512, 512, 3)
         │
         ▼
CNN Ensemble Layers
  - Multiple convolutional blocks
  - Batch normalization
  - ReLU activation
  - Max pooling
  - Dropout regularization
         │
         ▼
Dense Layers
  - Feature extraction
  - Flattening
         │
         ▼
Output Layer (Softmax)
  - 4 neurons (one per class)
  - Probability distribution [0-1]
         │
         ▼
Prediction
  - Argmax: class index
  - Max value: confidence score
```

---

## Data Flow

### Request Flow (Detailed)

```
1. USER UPLOADS IMAGE
   ┌─────────────────────────────────────────┐
   │ React Frontend (DiseaseDetection.js)    │
   │ - File selected via input or drag-drop  │
   │ - Preview image                         │
   │ - User clicks "Analyze"                 │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
2. FRONTEND CALLS API
   ┌─────────────────────────────────────────┐
   │ mlApi.js - predictDisease()             │
   │ - Create FormData                       │
   │ - POST to /ml/predict                   │
   │ - Header: multipart/form-data           │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
3. NODE.js BACKEND RECEIVES REQUEST
   ┌─────────────────────────────────────────┐
   │ server/routes/ai.js                     │
   │ - Route: POST /disease-detection        │
   │ - Middleware: authenticate (JWT)        │
   │ - Middleware: upload.single('file')     │
   │ - Call: predictPlantDisease()           │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
4. FILE UPLOAD MIDDLEWARE
   ┌─────────────────────────────────────────┐
   │ server/middleware/upload.js             │
   │ - Store file in memory (Multer)         │
   │ - File accessible as req.file           │
   │ - File.buffer contains image bytes      │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
5. BACKEND PROXIES TO ML SERVICE
   ┌─────────────────────────────────────────┐
   │ server/controllers/predictionController │
   │ - Get req.file.buffer                   │
   │ - Create new FormData                   │
   │ - POST to ML_SERVICE_URL/api/predict    │
   │ - Include file with correct MIME type   │
   │ - Timeout: 30 seconds                   │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
6. PYTHON ML SERVICE PROCESSES IMAGE
   ┌─────────────────────────────────────────┐
   │ ml-service/app.py - predict()           │
   │ - Receive file upload                   │
   │ - Open image with PIL                   │
   │ - Convert to RGB                        │
   │ - Resize to 512x512                     │
   │ - Normalize: array / 255.0              │
   │ - Expand dimensions for batch           │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
7. LOAD MODEL (if not cached)
   ┌─────────────────────────────────────────┐
   │ resolve_model_path()                    │
   │ - Check local models directory          │
   │ - Download from Hugging Face if needed  │
   │ - Use fallback path if all else fails   │
   │ - Load via tf.keras.models.load_model() │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
8. RUN INFERENCE
   ┌─────────────────────────────────────────┐
   │ model.predict(image_array)              │
   │ - Input: (1, 512, 512, 3) tensor        │
   │ - Output: (1, 4) probability array      │
   │ - Example: [0.92, 0.05, 0.02, 0.01]    │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
9. POST-PROCESS RESULTS
   ┌─────────────────────────────────────────┐
   │ - class_idx = argmax(predictions)       │
   │ - confidence = max(predictions)         │
   │ - Map index to CLASS_NAMES              │
   │ - Create result dict:                   │
   │   {                                     │
   │     prediction: "Rust",                 │
   │     confidence: 0.92,                   │
   │     all_predictions: {...}              │
   │   }                                     │
   └─────────────┬───────────────────────────┘
                 │
                 ▼
10. RETURN TO BACKEND
    ┌─────────────────────────────────────────┐
    │ HTTP 200 JSON Response                  │
    │ {                                       │
    │   success: true,                        │
    │   data: {                               │
    │     prediction: "Rust",                 │
    │     confidence: 0.92,                   │
    │     all_predictions: {                  │
    │       Healthy: 0.05,                    │
    │       Rust: 0.92,                       │
    │       Scab: 0.02,                       │
    │       Multiple_Diseases: 0.01           │
    │     }                                   │
    │   }                                     │
    │ }                                       │
    └─────────────┬───────────────────────────┘
                  │
                  ▼
11. BACKEND RETURNS TO FRONTEND
    ┌─────────────────────────────────────────┐
    │ Express sends JSON response             │
    └─────────────┬───────────────────────────┘
                  │
                  ▼
12. FRONTEND DISPLAYS RESULTS
    ┌─────────────────────────────────────────┐
    │ DiseaseDetection.js                     │
    │ - Update state with result              │
    │ - Display disease info card             │
    │ - Show symptoms                         │
    │ - Show recommendations                  │
    │ - Display confidence bars               │
    │ - Render all class probabilities        │
    └─────────────────────────────────────────┘
```

### Response JSON Example

```json
{
  "success": true,
  "data": {
    "prediction": "Rust",
    "confidence": 0.9247,
    "all_predictions": {
      "Healthy": 0.0245,
      "Multiple_Diseases": 0.0134,
      "Rust": 0.9247,
      "Scab": 0.0374
    }
  }
}
```

---

## Backend Integration

### Node.js Express Routes

**File**: `server/routes/ai.js`

```javascript
router.post('/disease-detection', authenticate, upload.single('file'), predictPlantDisease);
```

- **Route**: `POST /api/ml/disease-detection`
- **Middleware**: JWT authentication required
- **Middleware**: Single file upload (multipart/form-data)
- **Controller**: `predictionController.js`

### Controller Logic

**File**: `server/controllers/predictionController.js`

```javascript
exports.predictPlantDisease = async (req, res) => {
  // 1. Validate file exists
  // 2. Create FormData
  // 3. Append file buffer
  // 4. POST to ML service
  // 5. Return prediction or error
  // 6. Handle connection failures gracefully
}
```

**Error Handling**:
- `400 Bad Request`: No file provided
- `503 Service Unavailable`: ML service not running
- `502 Bad Gateway`: ML service request failed
- `200 Success`: Returns prediction data

### Environment Configuration

**Backend ML settings** (in `.env`):

```env
ML_SERVICE_URL=http://127.0.0.1:8000
```

This tells the Express backend where to find the Python FastAPI service.

---

## Frontend Integration

### Disease Detection Component

**File**: `client/src/pages/ai/DiseaseDetection.js`

#### Features

1. **Image Upload**
   - Click to browse files
   - Drag and drop support
   - Preview before analysis

2. **Image Processing**
   - File validation
   - Loading state during prediction
   - Error display with helpful messages

3. **Results Display**
   - Disease classification
   - Confidence percentage
   - Detailed disease information:
     - Symptoms
     - Recommendations
     - Color-coded severity

### Disease Information Map

```javascript
const DISEASE_INFO = {
  Healthy: {
    label: 'Healthy',
    color: 'success',        // Green
    icon: <Park />,
    description: '...',
    symptoms: [...],
    recommendations: [...]
  },
  Rust: {
    label: 'Rust',
    color: 'warning',        // Orange
    icon: <Warning />,
    description: '...',
    symptoms: [...],
    recommendations: [...]
  },
  Scab: {
    label: 'Scab',
    color: 'warning',        // Yellow
    icon: <Warning />,
    description: '...',
    symptoms: [...],
    recommendations: [...]
  },
  Multiple_Diseases: {
    label: 'Multiple Diseases',
    color: 'error',          // Red
    icon: <BugReport />,
    description: '...',
    symptoms: [...],
    recommendations: [...]
  }
}
```

### API Service

**File**: `client/src/services/mlApi.js`

```javascript
export const predictDisease = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/ml/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};
```

---

## Environment Configuration

### ML Service Environment Variables

**File**: `.env` (Project Root)

```env
# ML Service URL (where Python FastAPI runs)
ML_SERVICE_URL=http://127.0.0.1:8000

# Hugging Face Model Repository
HF_MODEL_REPO_ID=Sang2002P/prospera-plant-disease

# Hugging Face API Endpoint (optional - for API-based inference)
HF_INFERENCE_API_URL=https://router.huggingface.co/hf-inference/models/Sang2002P/prospera-plant-disease

# Hugging Face Authentication Token
HF_TOKEN=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
```

### Model Loading Priority

1. **Check Local Cache**
   ```
   ml-service/models/plant_disease_model.keras
   ```

2. **Fallback to Root Directory**
   ```
   ml-service/plant_disease_model.keras
   ```

---

## API Endpoints

### Health Check

**Endpoint**: `GET /health`

**URL**: `http://localhost:8000/health`

**Response**:
```json
{
  "status": "online",
  "model_loaded": true,
  "classes": ["Healthy", "Multiple_Diseases", "Rust", "Scab"]
}
```

**Purpose**: Verify ML service is running and model is loaded

---

### Predict Disease (Python ML Service)

**Endpoint**: `POST /api/predict`

**URL**: `http://localhost:8000/api/predict`

**Input**:
- Multipart form data with file upload
- Field name: `file`
- Accepted: JPEG, PNG, BMP, GIF

**Response**:
```json
{
  "prediction": "Rust",
  "confidence": 0.9247,
  "all_predictions": {
    "Healthy": 0.0245,
    "Multiple_Diseases": 0.0134,
    "Rust": 0.9247,
    "Scab": 0.0374
  }
}
```

**Error Response**:
```json
{
  "error": "Description of what went wrong"
}
```

---

### Predict Disease (Express Backend)

**Endpoint**: `POST /api/ml/disease-detection`

**URL**: `http://localhost:5000/api/ml/disease-detection`

**Headers Required**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Input**:
- Multipart form with file field

**Response Success**:
```json
{
  "success": true,
  "data": {
    "prediction": "Rust",
    "confidence": 0.9247,
    "all_predictions": {...}
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "ML service is not running...",
  "details": "..."
}
```

---

## Disease Classification

### Class Labels

| Class | Type | Severity |
|-------|------|----------|
| **Healthy** | Normal | ✓ No Action |
| **Rust** | Fungal Disease | ⚠️ Medium |
| **Scab** | Fungal Disease | ⚠️ Medium |
| **Multiple_Diseases** | Multiple Issues | 🔴 High |

### Healthy Plants

- **Label**: `Healthy`
- **Color Code**: Green (Success)
- **Symptoms**:
  - Normal leaf coloring
  - No lesions or spots
  - Firm and upright structure
- **Recommendations**:
  - Continue regular watering and fertilization
  - Monitor weekly for early signs
  - Maintain proper spacing for airflow

### Rust Disease

- **Label**: `Rust`
- **Color Code**: Orange (Warning)
- **Symptoms**:
  - Orange or rusty-brown pustules on leaf surfaces
  - Yellowing of surrounding leaf tissue
  - Premature defoliation in severe cases
- **Recommendations**:
  - Remove and destroy infected leaves immediately
  - Apply sulfur-based or copper fungicide
  - Avoid overhead irrigation
  - Improve air circulation

### Scab Disease

- **Label**: `Scab`
- **Color Code**: Yellow (Warning)
- **Symptoms**:
  - Olive-green to dark-brown lesions on leaves
  - Corky or scab-like spots on fruit
  - Distorted or curled young leaves
- **Recommendations**:
  - Apply fungicide at early bud break
  - Rake and remove fallen leaves
  - Prune for better canopy airflow
  - Use scab-resistant varieties

### Multiple Diseases

- **Label**: `Multiple_Diseases`
- **Color Code**: Red (Error)
- **Symptoms**:
  - Mixed symptoms: lesions, pustules, spots
  - Widespread discoloration of foliage
  - Rapid deterioration of plant health
- **Recommendations**:
  - Consult agricultural expert immediately
  - Apply broad-spectrum fungicide
  - Isolate affected plants
  - Collect samples for lab diagnosis

---

## Running the ML Services

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- Node.js 14+ (for backend)
- MongoDB (for database)

### Setup ML Service (Python)

1. **Create Virtual Environment**
   ```bash
   cd ml-service
   python -m venv .venv
   ```

2. **Activate Virtual Environment**
   ```bash
   # Windows
   .venv\Scripts\activate
   
   # macOS/Linux
   source .venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

   **Key Dependencies**:
   - `fastapi>=0.104.1` - Web framework
   - `uvicorn>=0.24.0` - ASGI server
   - `tensorflow>=2.18.0` - ML framework
   - `pillow>=10.1.0` - Image processing
   - `numpy>=1.26.0` - Numerical computing
   - `huggingface_hub>=0.24.0` - Model download
   - `python-dotenv>=1.0.1` - Environment variables

4. **Run ML Service**
   ```bash
   python app.py
   ```

   **Output**:
   ```
   ============================================================
   🌿 Plant Disease Detection API
   ============================================================
   🚀 Starting server...
   📱 Frontend: http://localhost:8000
   📊 API: http://localhost:8000/api/predict
   ❤️  Health: http://localhost:8000/health
   ============================================================
   ```

5. **Verify Service**
   ```bash
   curl http://localhost:8000/health
   ```

### Setup Backend (Node.js)

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Start Backend**
   ```bash
   npm start
   # or
   node index.js
   ```

   **Runs on**: `http://localhost:5000`

### Setup Frontend (React)

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start Frontend**
   ```bash
   npm start
   ```

   **Runs on**: `http://localhost:3000` (or `3001` as per `.env`)

### Complete Startup Sequence

```bash
# Terminal 1: Start ML Service
cd ml-service
python -m venv .venv
# Activate venv (Windows/macOS/Linux)
pip install -r requirements.txt
python app.py
# Runs on http://localhost:8000

# Terminal 2: Start Backend
cd server
npm install (if first time)
npm start
# Runs on http://localhost:5000

# Terminal 3: Start Frontend
cd client
npm install (if first time)
npm start
# Runs on http://localhost:3000 or 3001
```

### Health Checks

Verify all services are running:

```bash
# ML Service Health
curl http://localhost:8000/health

# Backend Health (if endpoint exists)
curl http://localhost:5000/health

# Frontend
open http://localhost:3000
```

---

## Model Loading Strategies

### Strategy 1: Local Cache (Preferred)

```python
# Check: ml-service/models/plant_disease_model.keras
local_candidate = os.path.join(MODEL_DIR, HF_MODEL_FILENAME)
if os.path.exists(local_candidate):
    print(f"Using local model: {local_candidate}")
    model = tf.keras.models.load_model(local_candidate)
    return  # Success
```

**Pros**:
- Fastest loading (no download)
- No internet required
- No authentication needed
- Offline operation

**Cons**:
- Requires model file to exist
- Manual model updates needed

### Strategy 2: Fallback (Legacy)

```python
fallback = os.path.join(BASE_DIR, 'plant_disease_model.keras')
print(f"Using fallback model path: {fallback}")
model = tf.keras.models.load_model(fallback)
```

**Purpose**:
- Backup if both above strategies fail
- Legacy support
- Root directory model file

**Pros**:
- Always available as last resort

**Cons**:
- Not recommended for production

### Flow Diagram

```
Model Loading Decision Tree:

START
  │
  ├─ Check local cache (ml-service/models/)
  │  │
  │  ├─ FOUND ──→ Load and Return ✓
  │  │
  │  └─ NOT FOUND
  │      │
  │      ├─ HF_MODEL_REPO_ID set?
  │      │  │
  │      │  ├─ YES ──→ Try Hugging Face download
  │      │  │          │
  │      │  │          ├─ SUCCESS ──→ Load and Return ✓
  │      │  │          │
  │      │  │          └─ FAILED ──→ Continue
  │      │  │
  │      │  └─ NO ──→ Continue
  │      │
  │      └─ Try Fallback (root directory)
  │         │
  │         ├─ SUCCESS ──→ Load and Return ✓
  │         │
  │         └─ FAILED ──→ Error: Model not found ✗

END
```

---

## Troubleshooting

### Issue: "ML service is not running"

**Solution**:
1. Check ML service is started: `python app.py` (in `ml-service/`)
2. Verify port 8000 is accessible
3. Check `.env` has correct `ML_SERVICE_URL`
4. Try health endpoint: `curl http://localhost:8000/health`

### Issue: "Model not loaded"

**Solution**:
1. Check model file exists in `ml-service/models/`
2. Verify `HF_TOKEN` is set in `.env` for Hugging Face download
3. Check disk space (model ~200MB)
4. Try manual download: `hf_hub_download(repo_id='Sang2002P/prospera-plant-disease', filename='plant_disease_model.keras')`

### Issue: Slow Prediction

**Solution**:
1. First run slower due to model loading
2. Use local cache strategy (copy model to `ml-service/models/`)
3. Check GPU availability (if TensorFlow configured for CUDA)
4. Monitor server resource usage

### Issue: File Upload Error

**Solution**:
1. Check file size < 50MB (adjust in server middleware if needed)
2. Verify file is valid image format (JPEG, PNG, etc.)
3. Check authentication token (JWT) is valid
4. Verify multipart form encoding

---

## Performance Metrics

### Latency Breakdown (Typical)

| Stage | Time |
|-------|------|
| Image upload | 50-200ms |
| File processing | 10-50ms |
| Model inference | 500-2000ms |
| Response | 50-100ms |
| **Total** | **~1-2.5 seconds** |

### Throughput

- **Concurrent requests**: Limited by GPU memory
- **Single GPU**: ~2-5 predictions/second
- **CPU only**: ~0.5-1 prediction/second

### Memory Usage

- **Model size**: ~200MB (Keras format)
- **Inference memory**: ~300MB per request
- **Server base**: ~200-500MB

---

## Future Enhancements

1. **Model Versioning**
   - Track multiple model versions
   - A/B testing capabilities

2. **Batch Processing**
   - Process multiple images at once
   - Improved throughput

3. **Confidence Thresholds**
   - Return "uncertain" for low confidence
   - Manual review workflow

4. **Explainability**
   - Attention maps showing affected areas
   - Grad-CAM visualization

5. **Model Updates**
   - Continuous learning
   - Retraining pipeline

6. **Mobile Optimization**
   - TensorFlow Lite conversion
   - On-device inference

7. **Multi-Model Support**
   - Pest detection model
   - Nutrient deficiency detection
   - Weed identification

---

## Documentation Files Reference

- **ML Service Code**: `ml-service/app.py`
- **Backend Controller**: `server/controllers/predictionController.js`
- **Backend Route**: `server/routes/ai.js`
- **Frontend Component**: `client/src/pages/ai/DiseaseDetection.js`
- **ML API Service**: `client/src/services/mlApi.js`
- **Environment Config**: `.env`
- **Requirements**: `ml-service/requirements.txt`
- **Integration Guide**: `ai tool support/MERN_INTEGRATION_INSTRUCTIONS.md`

---

## Contact & Support

For issues or questions about ML models, refer to:
1. Model source: `Sang2002P/prospera-plant-disease` (Hugging Face)
2. FastAPI docs: `http://localhost:8000/docs` (interactive API documentation)
3. Project repository documentation

---

**Last Updated**: May 2026  
**System Version**: Prospera 1.0  
**ML Model Version**: Plant Disease Detection v1.0
