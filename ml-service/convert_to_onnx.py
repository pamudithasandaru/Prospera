"""Convert the local Keras plant disease model to ONNX."""

import os
import sys


def convert_keras_to_onnx():
    """Convert plant_disease_model.keras to ONNX format."""
    print("=" * 60)
    print("🔄 Keras → ONNX Conversion")
    print("=" * 60)

    keras_path = os.path.join('models', 'plant_disease_model.keras')
    onnx_path = os.path.join('models', 'plant_disease_model.onnx')

    if not os.path.exists(keras_path):
        print(f"❌ Error: {keras_path} not found")
        sys.exit(1)

    keras_size = os.path.getsize(keras_path) / (1024 * 1024)
    print(f"📦 Source Keras model: {keras_size:.1f} MB")

    try:
        import tensorflow as tf
        import tf2onnx
    except Exception as exc:
        print(f"❌ Missing dependency: {exc}")
        sys.exit(1)

    print("\n💾 Loading Keras model...")
    model = tf.keras.models.load_model(keras_path, compile=False)
    print(f"✓ Input shape: {model.input_shape}")
    print(f"✓ Output shape: {model.output_shape}")

    print("\n🔄 Converting directly to ONNX...")
    input_signature = [
        tf.TensorSpec((None, 512, 512, 3), tf.float32, name='input')
    ]
    onnx_model, _ = tf2onnx.convert.from_keras(
        model,
        input_signature=input_signature,
        opset=13,
    )

    with open(onnx_path, 'wb') as f:
        f.write(onnx_model.SerializeToString())

    if not os.path.exists(onnx_path):
        print(f"❌ ONNX model not created at {onnx_path}")
        sys.exit(1)

    onnx_size = os.path.getsize(onnx_path) / (1024 * 1024)
    reduction = ((keras_size - onnx_size) / keras_size) * 100

    print("\n" + "=" * 60)
    print("📈 Size Reduction Results:")
    print("=" * 60)
    print(f"Original (Keras):  {keras_size:.1f} MB")
    print(f"Converted (ONNX):  {onnx_size:.1f} MB")
    print(f"Size Reduction:    {reduction:.0f}%")
    print(f"File saved:        {onnx_path}")
    print("=" * 60)

    return onnx_path


if __name__ == "__main__":
    onnx_path = convert_keras_to_onnx()
    print("\n✅ Step 1 complete: Keras model converted to ONNX")
    print("📍 Next: Run quantize_onnx.py to reduce size further")
