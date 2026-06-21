import sys
import json
import fitz
import base64
import io
from PIL import Image

def pdf_to_base64_images(pdf_path):
    doc = fitz.open(pdf_path)
    base64_images = []
    
    for i in range(len(doc)):
        page = doc[i]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        
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
