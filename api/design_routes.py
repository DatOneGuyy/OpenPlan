from flask import Blueprint, request, jsonify
import base64
import numpy as np
import cv2
import requests
from config import GEMINI_API_KEY, GEMINI_GENERATE_URL
from utils.image_utils import clean_b64, get_ref_b64

design_bp = Blueprint('design', __name__)

@design_bp.route('/api/generate_masks', methods=['POST'])
def generate_masks():
    data = request.json
    width = data.get('width')
    height = data.get('height')
    polygons = data.get('polygons', [])
    ids = data.get('ids', [])
    
    if not width or not height:
        return jsonify({"error": "Missing dimensions"}), 400
        
    mask_results = []
    PADDING = 1
    kernel = np.ones((PADDING, PADDING), np.uint8)

    for i, poly in enumerate(polygons):
        mask = np.zeros((height, width), dtype=np.uint8)
        pts = np.array([[p['x'], p['y']] for p in poly], np.int32)
        pts = pts.reshape((-1, 1, 2))
        cv2.fillPoly(mask, [pts], 255)
        mask = cv2.dilate(mask, kernel, iterations=1)
        area = cv2.countNonZero(mask)
        _, buffer = cv2.imencode('.png', mask)
        mask_base64 = base64.b64encode(buffer).decode('utf-8')
        
        mask_results.append({
            "index": i,
            "id": ids[i] if i < len(ids) else None,
            "area": area,
            "base64": mask_base64
        })
        
    return jsonify({"masks": mask_results}), 200

@design_bp.route('/api/generate', methods=['POST'])
def generate_image():
    if not GEMINI_API_KEY:
        return jsonify({"error": "No API key configured"}), 500
        
    data = request.json
    item_name = data.get('itemName', 'Furniture')
    item_category = data.get('itemCategory', 'Object')
    mask_base64 = data.get('maskBase64')
    image_base64 = data.get('imageBase64')
    furniture_image = data.get('furnitureImage')
    
    if not all([image_base64, mask_base64, furniture_image]):
        return jsonify({"error": "Missing image, mask, or furniture reference"}), 400

    base_image_clean = clean_b64(image_base64)
    mask_clean = clean_b64(mask_base64)
    ref_image_clean = get_ref_b64(furniture_image)

    refined_prompt = (
        f"Instruction: In the first image, using the second image as a mask (white area is the target zone), "
        f"seamlessly inpaint a {item_name}. Use ONLY the foreground object in the third image as a style and material reference for the {item_category}. Match the room's lighting, perspective, and shadows."
    )

    payload = {
        "contents": [{
            "role": "user",
            "parts": [
                { "inline_data": { "mime_type": "image/jpeg", "data": base_image_clean } },
                { "inline_data": { "mime_type": "image/png", "data": mask_clean } },
                { "inline_data": { "mime_type": "image/jpeg", "data": ref_image_clean } },
                { "text": refined_prompt }
            ]
        }],
        "generationConfig": { "responseModalities": ["IMAGE"] }
    }

    try:
        response = requests.post(GEMINI_GENERATE_URL, headers={"Content-Type": "application/json"}, json=payload)
        response_data = response.json()

        if response.status_code != 200:
            return jsonify({"error": response_data}), response.status_code

        candidates = response_data.get('candidates', [])
        if not candidates:
            return jsonify({"error": "No candidates returned"}), 500

        generated_image_b64 = None
        for part in candidates[0].get('content', {}).get('parts', []):
            if 'inlineData' in part and 'data' in part['inlineData']:
                generated_image_b64 = f"data:image/png;base64,{part['inlineData']['data']}"
                break
        
        if not generated_image_b64:
            return jsonify({"error": "No image data found in response"}), 500

        return jsonify({"generated_image": generated_image_b64}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
