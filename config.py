import os

# API Keys
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
SERPAPI_API_KEY = os.environ.get('SERPAPI_API_KEY')

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-12345')

# Database
SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# API URLs - Note: models/gemini-pro-vision or gemini-1.5-flash-latest are standard
# gemini-3-pro-image-preview is a highly experimental model name and might 
# require specific allowlisting or regional availability.
BASE_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models"
MODEL_NAME = "gemini-3-pro-image-preview"

GEMINI_GENERATE_URL = f"{BASE_GEMINI_URL}/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
GEMINI_ANALYZE_URL = f"{BASE_GEMINI_URL}/{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
GEMINI_PREDICT_URL = f"{BASE_GEMINI_URL}/{MODEL_NAME}:predict?key={GEMINI_API_KEY}"
SERPAPI_SEARCH_URL = 'https://serpapi.com/search.json'
