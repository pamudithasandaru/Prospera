import os
from pathlib import Path
from typing import Annotated

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Base directory of this script so paths work regardless of cwd
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(BASE_DIR, 'plant_disease_model.keras'))
MODEL_URL = os.getenv('MODEL_URL')

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import tensorflow as tf
from PIL import Image
import numpy as np
import io
import requests

tf.get_logger().setLevel('ERROR')

app = FastAPI(title="Plant Disease Detection API")


def ensure_model_file():
    model_file = Path(MODEL_PATH)
    if model_file.exists():
        return str(model_file)

    if not MODEL_URL:
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH} and MODEL_URL is not set."
        )

    model_file.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading model from {MODEL_URL} to {MODEL_PATH}...")

    with requests.get(MODEL_URL, stream=True, timeout=120) as response:
        response.raise_for_status()
        with open(model_file, 'wb') as output_file:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    output_file.write(chunk)

    print(f"Model downloaded to {MODEL_PATH}")
    return str(model_file)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5000",
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# Load model with proper error handling
try:
    resolved_model_path = ensure_model_file()
    model = tf.keras.models.load_model(resolved_model_path, compile=False)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Make sure MODEL_PATH exists locally or MODEL_URL points to a downloadable .keras file")
    model = None

# Define class names (from your notebook training)
CLASS_NAMES = ['Healthy', 'Multiple_Diseases', 'Rust', 'Scab']

# Routes
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve a simple status page."""
    return "<h1>Plant Disease Detection API</h1><p>Use /health and /api/predict.</p>"

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "online",
        "model_loaded": model is not None,
        "classes": CLASS_NAMES
    }

@app.post("/api/predict")
async def predict(file: Annotated[UploadFile, File(...)]):
    """Predict plant disease from uploaded image"""
    try:
        if not model:
            return {"error": "Model not loaded"}
        
        # Read image
        image = Image.open(io.BytesIO(await file.read())).convert('RGB')
        
        # Resize to model input size (512x512 - from ensemble model)
        image = image.resize((512, 512))
        
        # Preprocess
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        
        # Predict
        predictions = model.predict(image_array, verbose=0)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        
        return {
            "prediction": CLASS_NAMES[class_idx],
            "confidence": confidence,
            "all_predictions": {CLASS_NAMES[i]: float(predictions[0][i]) for i in range(len(CLASS_NAMES))}
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict")
async def predict_legacy(file: Annotated[UploadFile, File(...)]):
    """Legacy endpoint for backward compatibility"""
    return await predict(file)

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🌿 Plant Disease Detection API")
    print("="*60)
    print("🚀 Starting server...")
    print("📱 Frontend: http://localhost:8000")
    print("📊 API: http://localhost:8000/api/predict")
    print("❤️  Health: http://localhost:8000/health")
    print("="*60 + "\n")
    uvicorn.run(
        app,
        host=os.getenv('HOST', '127.0.0.1'),
        port=int(os.getenv('PORT', '8000')),
    )
