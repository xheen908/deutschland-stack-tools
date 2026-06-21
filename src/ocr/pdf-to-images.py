import sys
import json
import base64
import io
from pdf2image import convert_from_path

def pdf_to_base64_images(pdf_path):
    # dpi=150 is usually enough for OCR and keeps image size reasonable
    pages = convert_from_path(pdf_path, dpi=150)
    base64_images = []
    
    for img in pages:
        img = img.convert("RGB")
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        base64_images.append(img_str)
        
    print(json.dumps(base64_images))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pdf-to-images.py <pdf_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_to_base64_images(sys.argv[1])
