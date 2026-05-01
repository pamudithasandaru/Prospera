"""Quantize the ONNX model to int8 for smaller size and faster inference."""

import os
import sys


def quantize_onnx_model():
    """Quantize ONNX model from float32 to int8."""
    print("=" * 60)
    print("🔢 ONNX Quantization (Float32 → Int8)")
    print("=" * 60)

    onnx_path = os.path.join('models', 'plant_disease_model.onnx')
    quantized_path = os.path.join('models', 'plant_disease_model_quantized.onnx')

    if not os.path.exists(onnx_path):
        print(f"❌ Error: {onnx_path} not found")
        print("   Run convert_to_onnx.py first")
        sys.exit(1)

    original_size = os.path.getsize(onnx_path) / (1024 * 1024)
    print(f"📦 Source ONNX model: {original_size:.1f} MB")

    try:
        import onnx
        from onnxruntime.quantization import QuantType, quantize_dynamic
    except Exception as exc:
        print(f"❌ Missing dependency: {exc}")
        sys.exit(1)

    print("\n🔍 Loading ONNX model...")
    try:
        onnx_model = onnx.load(onnx_path)
        onnx.checker.check_model(onnx_model)
        print("✓ ONNX model loaded and validated")
    except Exception as exc:
        print(f"❌ Error loading model: {exc}")
        sys.exit(1)

    print("\n🔢 Quantizing to int8 (dynamic quantization)...")
    try:
        quantize_dynamic(
            onnx_path,
            quantized_path,
            weight_type=QuantType.QInt8,
            per_channel=True,
            reduce_range=False,
        )
        print("✓ Quantization complete")
    except Exception as exc:
        print(f"❌ Quantization error: {exc}")
        sys.exit(1)

    print("\n🔍 Verifying quantized model...")
    try:
        quantized_model = onnx.load(quantized_path)
        onnx.checker.check_model(quantized_model)
        print("✓ Quantized model valid")
    except Exception as exc:
        print(f"⚠️  Warning: {exc}")

    quantized_size = os.path.getsize(quantized_path) / (1024 * 1024)
    quantization_reduction = ((original_size - quantized_size) / original_size) * 100

    keras_size = 200
    total_reduction = ((keras_size - quantized_size) / keras_size) * 100

    print("\n" + "=" * 60)
    print("📈 Quantization Results:")
    print("=" * 60)
    print(f"Original ONNX:     {original_size:.1f} MB")
    print(f"Quantized (int8):  {quantized_size:.1f} MB")
    print(f"Quantization:      {quantization_reduction:.0f}% reduction")
    print(f"\n📊 Total from Keras Original:")
    print(f"Original Keras:    {keras_size:.1f} MB")
    print(f"Final Quantized:   {quantized_size:.1f} MB")
    print(f"Total Reduction:   {total_reduction:.0f}%")
    print(f"File saved:        {quantized_path}")
    print("=" * 60)

    return quantized_path


if __name__ == "__main__":
    quantized_path = quantize_onnx_model()
    print("\n✅ Step 2 complete: ONNX model quantized to int8")
    print("📍 Next: Run app_optimized.py to use quantized model with OpenCV")
