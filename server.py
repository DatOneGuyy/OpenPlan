from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
# Enable CORS so your HTML/JS frontend can communicate with this API
CORS(app)

@app.route('/api/carve', methods=['POST'])
def carve_image():
    # 1. Receive the JSON payload from the frontend
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400

    prompt = data.get('prompt')
    mask_base64 = data.get('maskBase64')
    base_image_base64 = data.get('imageBase64')

    if not prompt or not mask_base64:
        return jsonify({"error": "Missing prompt or mask data"}), 400

    print(f"--- New Carve Request ---")
    print(f"Prompt: {prompt}")
    print(f"Mask Data Length: {len(mask_base64)} characters")
    
    # Optional: Clean the Base64 strings if the frontend includes the data URI header
    # e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRg..." -> "/9j/4AAQSkZJRg..."
    if mask_base64.startswith('data:image'):
        mask_base64 = mask_base64.split(',')[1]
    if base_image_base64 and base_image_base64.startswith('data:image'):
        base_image_base64 = base_image_base64.split(',')[1]

    # 2. Construct the payload for Nano Banana 2 (Gemini 3 Flash Image)
    # This is exactly how the model expects the data for inpainting
    gemini_payload = {
        "instances": [
            {
                "prompt": prompt,
                "image": {
                    "bytesBase64Encoded": base_image_base64
                },
                "mask": {
                    "image": {
                        "bytesBase64Encoded": mask_base64
                    }
                }
            }
        ],
        "parameters": {
            "sampleCount": 1,
            "mode": "edit",
            "editConfig": {
                "editMode": "inpainting"
            }
        }
    }

    # 3. TODO: Make the actual request to the Google API using the 'requests' library
    # response = requests.post(GOOGLE_API_ENDPOINT, headers=headers, json=gemini_payload)
    # result_data = response.json()
    
    # 4. For now, simulate a successful response to send back to the frontend
    return jsonify({
        "status": "success",
        "message": "Data received and processed.",
        # Simulating the generated image URL you would extract from the real API response
        "generated_image_url": "https://i.ibb.co/C0wR68P/empty-room-with-sofa.jpg" 
    }), 200

if __name__ == '__main__':
    print("Starting Room Designer Backend on http://localhost:5000")
    app.run(debug=True, port=5000)