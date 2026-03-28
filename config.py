import os

# Helper to ensure we always have the freshest environment value
def get_env_var(var_name, default=None):
    return os.environ.get(var_name, default)

# Security (Safe default for local dev)
SECRET_KEY = get_env_var('SECRET_KEY', 'dev-secret-key-12345')

# Database
SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# API URLs & Configuration
# We use functions here to ensure the URL is built with the LATEST API key 
# value from the environment, solving import-order race conditions.

def get_gemini_key():
    return get_env_var('GEMINI_API_KEY')

def get_serpapi_key():
    return get_env_var('SERPAPI_API_KEY')

def get_gemini_url(service_type="generateContent"):
    key = get_gemini_key()
    base_url = "https://generativelanguage.googleapis.com/v1beta/models"
    model_name = "gemini-3-pro-image-preview" # Ensure this is correct for your key region
    
    if service_type == "predict":
        return f"{base_url}/{model_name}:predict?key={key}"
    return f"{base_url}/{model_name}:{service_type}?key={key}"

# SerpApi URL is static
SERPAPI_SEARCH_URL = 'https://serpapi.com/search.json'

# Keep these for backward compatibility in the rest of the app
# But ideally, we should use the getters above.
GEMINI_API_KEY = get_gemini_key()
SERPAPI_API_KEY = get_serpapi_key()
GEMINI_GENERATE_URL = get_gemini_url("generateContent")
GEMINI_ANALYZE_URL = get_gemini_url("generateContent")
GEMINI_PREDICT_URL = get_gemini_url("predict")
