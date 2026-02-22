# MERN Integration Instructions for Plant Disease Model

This guide explains how to use the existing Keras model (`plant_disease_model.keras`) inside a different MERN project.

## 1) Recommended Architecture

Use the model as a **separate Python inference service** and let your MERN backend call it.

- **React frontend** uploads image to **Node/Express API**
- **Node/Express API** forwards image to **Python FastAPI ML service**
- **FastAPI service** loads `plant_disease_model.keras` and returns prediction
- Optional: Node stores request/response in MongoDB

Why this is recommended:
- The model is native TensorFlow/Keras (`.keras`), which is easiest and most reliable in Python.
- You avoid complex TensorFlow.js model conversion and runtime differences.

---

## 2) Prepare Files You Need From This Repository

Copy these files into your new project (or keep them in a dedicated ML microservice repo):

- `plant_disease_model.keras`
- `app.py` (or `main.py` if you prefer that entrypoint)
- `requirements.txt`

Also copy `index.html` only if you want a standalone Python frontend for quick testing. For MERN integration, it is not required.

---

## 3) Create the Python ML Service (inside MERN workspace)

In your MERN workspace root, create a folder:

```bash
mkdir ml-service
```

Put these files in `ml-service/`:
- `app.py`
- `plant_disease_model.keras`
- `requirements.txt`

### 3.1 Update `ml-service/app.py` CORS for MERN

Make sure CORS includes your Node server and/or frontend during local development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite React dev server (if using Vite)
        "http://localhost:5000",  # Node/Express API (if browser calls Python directly)
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3.2 Create virtual environment and install dependencies

```bash
cd ml-service
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3.3 Run the ML service

```bash
python app.py
```

Default URL: `http://localhost:8000`

Verify health:

```bash
curl http://localhost:8000/health
```

Expected class labels:
- `Healthy`
- `Multiple_Diseases`
- `Rust`
- `Scab`

---

## 4) Connect Express Backend to Python ML Service

The safest pattern is: **React -> Express -> FastAPI**

## 4.1 Install Node packages in your MERN backend

```bash
npm install axios multer form-data
```

## 4.2 Add environment variable in backend `.env`

```env
ML_SERVICE_URL=http://localhost:8000
```

## 4.3 Create upload middleware

Create `server/middleware/upload.js`:

```js
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type. Use JPG, PNG, or WebP."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
```

## 4.4 Create prediction controller

Create `server/controllers/predictionController.js`:

```js
const axios = require("axios");
const FormData = require("form-data");

exports.predictPlantDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";

    const response = await axios.post(`${mlUrl}/api/predict`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      timeout: 30000,
    });

    // Optional: save to MongoDB here
    // await Prediction.create({ ...response.data, filename: req.file.originalname, userId: req.user?._id })

    return res.status(200).json(response.data);
  } catch (error) {
    const details = error.response?.data || error.message;
    return res.status(502).json({
      message: "ML service request failed",
      details,
    });
  }
};
```

## 4.5 Add prediction route

Create `server/routes/predictionRoutes.js`:

```js
const express = require("express");
const upload = require("../middleware/upload");
const { predictPlantDisease } = require("../controllers/predictionController");

const router = express.Router();

router.post("/predict", upload.single("file"), predictPlantDisease);

module.exports = router;
```

## 4.6 Register route in Express app

In your main backend file (for example `server/index.js` or `server/app.js`):

```js
const predictionRoutes = require("./routes/predictionRoutes");
app.use("/api/ml", predictionRoutes);
```

Your final endpoint for frontend becomes:

- `POST http://localhost:5000/api/ml/predict`

---

## 5) Connect React Frontend

## 5.1 Add API service helper

Create `client/src/services/mlApi.js`:

```js
import axios from "axios";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const predictDisease = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(`${API_BASE}/api/ml/predict`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};
```

## 5.2 Example React component usage

```jsx
import React, { useState } from "react";
import { predictDisease } from "../services/mlApi";

export default function DiseasePredictor() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      const data = await predictDisease(file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Plant Disease Prediction</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <h3>Prediction: {result.prediction}</h3>
          <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
          <pre>{JSON.stringify(result.all_predictions, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 6) Local Development Run Order

Start services in this order:

1. MongoDB
2. Express backend (`localhost:5000` example)
3. Python ML service (`localhost:8000`)
4. React frontend (`localhost:3000` or `localhost:5173`)

Quick checks:

- Python health: `GET http://localhost:8000/health`
- Node route: `POST http://localhost:5000/api/ml/predict` with form-data `file`
- React page displays `prediction`, `confidence`, and class probabilities

---

## 7) Production Deployment Notes

## 7.1 Use private service-to-service networking

- Keep ML service internal/private if possible.
- Do not expose raw ML endpoint publicly unless required.
- Allow only backend service to call Python service.

## 7.2 Set strict CORS and file limits

- Frontend CORS should include only your real domain.
- Keep max upload size (e.g., 25MB) to prevent abuse.

## 7.3 Timeouts and retries

- Keep backend timeout at 20–30 seconds.
- Add a retry policy only for transient network failures (not invalid images).

## 7.4 Optional prediction logging schema (MongoDB)

You can store:

- `filename`
- `prediction`
- `confidence`
- `all_predictions`
- `userId` (if authenticated)
- `createdAt`

---

## 8) Docker Compose Example (MERN + ML)

This is a sample structure. Adapt ports and paths to your project.

```yaml
version: "3.9"
services:
  mongo:
    image: mongo:7
    container_name: mongo
    ports:
      - "27017:27017"

  ml-service:
    build: ./ml-service
    container_name: ml-service
    ports:
      - "8000:8000"

  backend:
    build: ./server
    container_name: backend
    environment:
      - ML_SERVICE_URL=http://ml-service:8000
      - MONGO_URI=mongodb://mongo:27017/yourdb
    depends_on:
      - mongo
      - ml-service
    ports:
      - "5000:5000"

  frontend:
    build: ./client
    container_name: frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
```

### `ml-service/Dockerfile`

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "app.py"]
```

---

## 9) API Contract (Frontend/Backend)

Request:
- Method: `POST`
- URL: `/api/ml/predict`
- Body type: `multipart/form-data`
- Field name: `file`

Success response shape:

```json
{
  "prediction": "Rust",
  "confidence": 0.95,
  "all_predictions": {
    "Healthy": 0.02,
    "Multiple_Diseases": 0.01,
    "Rust": 0.95,
    "Scab": 0.02
  }
}
```

Error responses to handle:
- `400`: no file / invalid input
- `413`: file too large
- `415`: invalid image type
- `502`: ML service unavailable

---

## 10) Important Model Details You Must Keep

- Input size must be `512 x 512`
- Input color mode must be RGB
- Normalization must be `pixel / 255.0`
- Class order must stay exactly:
  1. `Healthy`
  2. `Multiple_Diseases`
  3. `Rust`
  4. `Scab`

If class order changes, your predictions will be mapped incorrectly.

---

## 11) Alternative (Not Recommended): Run Model Directly in Node

Possible via TensorFlow.js conversion, but not ideal for this model.

Trade-offs:
- More setup complexity
- Potential prediction differences
- Harder debugging/performance tuning

Use this only if you must remove Python from your stack.

---

## 12) Final Integration Checklist

- [ ] `ml-service` runs and `/health` returns `model_loaded: true`
- [ ] Express route `/api/ml/predict` forwards images correctly
- [ ] React uploads image using field name `file`
- [ ] Response renders prediction and confidence
- [ ] File type and size validation enabled in backend
- [ ] Environment variable `ML_SERVICE_URL` configured
- [ ] Production CORS restricted to real domains
- [ ] Services containerized and reachable via internal network

---

If you want, create this as a tracked task in your MERN repository and implement in this order:
1. Add `ml-service`
2. Add backend proxy endpoint
3. Add frontend upload UI
4. Add MongoDB prediction logs
5. Add Docker Compose and deployment config
