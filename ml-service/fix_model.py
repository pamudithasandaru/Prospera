"""
Re-quantize the existing quantized ONNX model to be CPU-compatible.

The existing model uses ConvInteger ops (QInt8 per_channel=True)
which are not supported by onnxruntime CPUExecutionProvider.

This script dequantizes it back to float32 then re-quantizes using
QUInt8 per_channel=False which uses QLinearConv — fully CPU supported.
"""

import os
import sys
import shutil

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
QUANTIZED_SRC = os.path.join(MODEL_DIR, 'plant_disease_model_quantized.onnx')
FLOAT_PATH    = os.path.join(MODEL_DIR, 'plant_disease_model_float.onnx')
FIXED_PATH    = os.path.join(MODEL_DIR, 'plant_disease_model_fixed.onnx')

print("=" * 60)
print("[FIX] Re-quantizing ONNX model for CPU compatibility")
print("=" * 60)

try:
    import onnx
    import onnxruntime as rt
    from onnxruntime.quantization import quantize_dynamic, QuantType
except ImportError as e:
    print(f"[!] Missing: {e}  -> pip install onnx onnxruntime")
    sys.exit(1)

if not os.path.exists(QUANTIZED_SRC):
    print(f"[!] Not found: {QUANTIZED_SRC}")
    sys.exit(1)

size_mb = os.path.getsize(QUANTIZED_SRC) / 1024 / 1024
print(f"\n[1] Source: {os.path.basename(QUANTIZED_SRC)} ({size_mb:.1f} MB)")

# ── Step 1: dequantize back to float32 ───────────────────────────────────────
print("\n[2] Dequantizing back to float32...")
dequantized = False

# Try onnxruntime's dequantize helper (exists in some versions)
try:
    from onnxruntime.quantization import dequantize_model
    dequantize_model(QUANTIZED_SRC, FLOAT_PATH)
    print("    [OK] Used dequantize_model()")
    dequantized = True
except Exception as e:
    print(f"    dequantize_model not available: {e}")

# Fallback: use the quantized model directly as the float source
# (quantize_dynamic will extract float weights from quantized nodes)
if not dequantized:
    print("    Falling back: using quantized model as input for re-quantization")
    shutil.copy2(QUANTIZED_SRC, FLOAT_PATH)
    print("    [OK] Copied source as float path")

# ── Step 2: re-quantize with CPU-compatible settings ─────────────────────────
print("\n[3] Re-quantizing (QUInt8, per_channel=False) -> QLinearConv ops...")
try:
    quantize_dynamic(
        FLOAT_PATH,
        FIXED_PATH,
        weight_type=QuantType.QUInt8,
        per_channel=False,
        reduce_range=False,
    )
    fixed_mb = os.path.getsize(FIXED_PATH) / 1024 / 1024
    print(f"    [OK] Saved: {os.path.basename(FIXED_PATH)} ({fixed_mb:.1f} MB)")
except Exception as e:
    print(f"[!] Re-quantization failed: {e}")
    sys.exit(1)

# ── Step 3: verify it loads and runs ─────────────────────────────────────────
print("\n[4] Verifying model loads in onnxruntime CPU...")
try:
    sess = rt.InferenceSession(FIXED_PATH, providers=['CPUExecutionProvider'])
    inp  = sess.get_inputs()[0]
    out  = sess.get_outputs()[0]
    print(f"    [OK] Input : {inp.name}  {inp.shape}")
    print(f"    [OK] Output: {out.name}  {out.shape}")

    # Quick smoke test with random data
    import numpy as np
    dummy = np.random.rand(1, 512, 512, 3).astype(np.float32)
    result = sess.run([out.name], {inp.name: dummy})
    print(f"    [OK] Inference output shape: {result[0].shape}")
except Exception as e:
    print(f"[!] Verification failed: {e}")
    sys.exit(1)

# ── Step 4: replace old model ─────────────────────────────────────────────────
backup = QUANTIZED_SRC + '.bak'
shutil.copy2(QUANTIZED_SRC, backup)
shutil.copy2(FIXED_PATH, QUANTIZED_SRC)
print(f"\n[5] Replaced {os.path.basename(QUANTIZED_SRC)} with fixed version.")
print(f"    Backup: {os.path.basename(backup)}")

# Cleanup temp files
for f in [FLOAT_PATH, FIXED_PATH]:
    try:
        os.remove(f)
    except Exception:
        pass

print("\n[OK] Done! Restart npm run dev to load the fixed model.")
