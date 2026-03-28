from flask import Flask, jsonify
from flask_cors import CORS
from api.design_routes import design_bp
from api.analysis_routes import analysis_bp
from api.furniture_routes import furniture_bp

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Register Blueprints
app.register_blueprint(design_bp)
app.register_blueprint(analysis_bp)
app.register_blueprint(furniture_bp)

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    # When running locally, use port 5000
    app.run(debug=True, port=5000)