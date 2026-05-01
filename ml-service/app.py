import os

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Base directory of this script so paths work regardless of cwd
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from dotenv import load_dotenv

# Load .env from ml-service first, then project root (if present)
load_dotenv(os.path.join(BASE_DIR, '.env'))
load_dotenv(os.path.join(BASE_DIR, '..', '.env'))

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import tensorflow as tf
from PIL import Image
import numpy as np
import io

tf.get_logger().setLevel('ERROR')

app = FastAPI(title="Plant Disease Detection API")

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

MODEL_DIR = os.path.join(BASE_DIR, 'models')


def resolve_model_path():
    """Resolve the model path from local files only."""
    model_candidates = [
        os.path.join(MODEL_DIR, 'plant_disease_model.keras'),
        os.path.join(BASE_DIR, 'plant_disease_model.keras'),
    ]

    for candidate in model_candidates:
        if os.path.exists(candidate):
            print(f"Using local model: {candidate}")
            return candidate

    print("No local plant_disease_model.keras file found.")
    return model_candidates[0]

# Load model with proper error handling
MODEL_PATH = resolve_model_path()
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model from {MODEL_PATH}: {e}")
    model = None

# Define class names (from your notebook training)
CLASS_NAMES = ['Healthy', 'Multiple_Diseases', 'Rust', 'Scab']

# Routes
@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the frontend HTML"""
    try:
        with open('index.html', 'r') as f:
            return f.read()
    except FileNotFoundError:
        return "<h1>Plant Disease Detection API</h1><p>Frontend not found. Make sure index.html is in the current directory.</p>"

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "online",
        "model_loaded": model is not None,
        "classes": CLASS_NAMES
    }

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
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
async def predict_legacy(file: UploadFile = File(...)):
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
