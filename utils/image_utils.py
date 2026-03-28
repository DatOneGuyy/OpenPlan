import base64
import requests

def clean_b64(b64):
    """Strips the data URI prefix from a base64 string if present."""
    if not b64:
        return ""
    if ',' in b64:
        return b64.split(',')[1]
    return b64

def get_ref_b64(ref):
    """Fetches a reference image from a URL or processes a base64 string."""
    if not ref:
        return ""
    if ref.startswith('http'):
        try:
            resp = requests.get(ref, timeout=10)
            if resp.status_code == 200:
                return base64.b64encode(resp.content).decode('utf-8')
        except Exception as e:
            print(f"Failed to fetch ref image: {e}")
    return clean_b64(ref)
