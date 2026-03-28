import os

# API Keys
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
SERPAPI_API_KEY = os.environ.get('SERPAPI_API_KEY')

# API URLs
GEMINI_GENERATE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key={GEMINI_API_KEY}"
GEMINI_ANALYZE_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key={GEMINI_API_KEY}"
GEMINI_PREDICT_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:predict?key={GEMINI_API_KEY}"
SERPAPI_SEARCH_URL = 'https://serpapi.com/search.json'
