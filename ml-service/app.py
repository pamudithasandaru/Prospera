import io
import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model

# Base directory of this script so paths work regardless of cwd
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load .env from ml-service first, then project root (if present)
load_dotenv(os.path.join(BASE_DIR, '.env'))
load_dotenv(os.path.join(BASE_DIR, '..', '.env'))

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

MODEL_PATH_ENV = os.getenv('MODEL_PATH', '').strip()


def resolve_model_path():
    candidates = [
        MODEL_PATH_ENV,
        os.path.join(BASE_DIR, 'plant_disease_model.keras'),
        os.path.join(BASE_DIR, 'models', 'plant_disease_model.keras'),
    ]
    for candidate in candidates:
        if candidate and os.path.exists(candidate):
            return candidate
    return None


MODEL_PATH = resolve_model_path()
MODEL = None
MODEL_INPUT_SIZE = None
MODEL_LOAD_ERROR = None

# Define class names (from your notebook training)
CLASS_NAMES = ['Healthy', 'Multiple_Diseases', 'Rust', 'Scab']
CLASS_NAME_LOOKUP = {
    name.lower().replace(' ', '_').replace('-', '_'): name
    for name in CLASS_NAMES
}


def normalize_label(label):
    return label.strip().lower().replace(' ', '_').replace('-', '_')


def canonical_label(label):
    normalized = normalize_label(label)
    return CLASS_NAME_LOOKUP.get(normalized, label.strip().replace(' ', '_'))


def load_prediction_model():
    global MODEL, MODEL_INPUT_SIZE

    if not MODEL_PATH:
        raise RuntimeError('No local model file found. Expected ml-service/plant_disease_model.keras')

    MODEL = load_model(MODEL_PATH, compile=False)
    input_shape = MODEL.input_shape
    if isinstance(input_shape, list):
        input_shape = input_shape[0]

    if len(input_shape) != 4 or input_shape[1] is None or input_shape[2] is None:
        raise RuntimeError(f'Unsupported model input shape: {input_shape}')

    MODEL_INPUT_SIZE = (int(input_shape[1]), int(input_shape[2]))


def preprocess_image(image: Image.Image):
    if MODEL_INPUT_SIZE is None:
        raise RuntimeError('Model input size is not initialized')

    target_height, target_width = MODEL_INPUT_SIZE
    resized = image.resize((target_width, target_height))
    image_array = np.asarray(resized, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


def predict_with_local_model(image: Image.Image):
    if MODEL is None:
        raise RuntimeError(MODEL_LOAD_ERROR or 'Local model is not loaded')

    prediction = MODEL.predict(preprocess_image(image), verbose=0)
    prediction = np.asarray(prediction).squeeze()

    if prediction.ndim != 1:
        raise RuntimeError(f'Unexpected model output shape: {prediction.shape}')

    if prediction.shape[0] != len(CLASS_NAMES):
        raise RuntimeError(
            f'Model outputs {prediction.shape[0]} classes, expected {len(CLASS_NAMES)} based on CLASS_NAMES'
        )

    class_scores = {
        CLASS_NAMES[index]: float(score)
        for index, score in enumerate(prediction)
    }
    best_class = max(class_scores, key=class_scores.get)
    return {
        'prediction': best_class,
        'confidence': class_scores[best_class],
        'all_predictions': class_scores,
    }


try:
    load_prediction_model()
except Exception as exc:
    MODEL_LOAD_ERROR = str(exc)

# Routes
@app.get("/", response_class=HTMLResponse)
def read_root():
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
        "model_loaded": MODEL is not None,
        "prediction_backend": "local-keras",
        "model_path": MODEL_PATH,
        "model_error": MODEL_LOAD_ERROR,
        "classes": CLASS_NAMES
    }

@app.post(
    "/api/predict",
    responses={500: {"description": "Prediction failed"}},
)
def predict(file: Annotated[UploadFile, File(...)]):
    """Predict plant disease from uploaded image"""
    image = Image.open(io.BytesIO(file.file.read())).convert('RGB')
    return predict_with_local_model(image)

@app.post(
    "/predict",
    responses={500: {"description": "Prediction failed"}},
)
def predict_legacy(file: Annotated[UploadFile, File(...)]):
    """Legacy endpoint for backward compatibility"""
    return predict(file)

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🌿 Plant Disease Detection API")
    print("="*60)
    print("🚀 Starting server...")
    print("📱 Frontend: http://localhost:8000")
    print("📊 API: http://localhost:8000/api/predict")
    print("❤️  Health: http://localhost:8000/health")
    if MODEL_PATH:
        print(f"🧠 Local Keras model: {MODEL_PATH}")
    if MODEL_LOAD_ERROR:
        print(f"⚠️ Model load error: {MODEL_LOAD_ERROR}")
    print("="*60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
