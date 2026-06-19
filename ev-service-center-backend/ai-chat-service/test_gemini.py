import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing API Key starting with: {api_key[:10] if api_key else 'None'}...")

genai.configure(api_key=api_key)

try:
    print("Available models:")
    for m in genai.list_models():
        if 'embedContent' in m.supported_generation_methods:
            print(f"Embedding model: {m.name}")
        elif 'generateContent' in m.supported_generation_methods:
            print(f"Generation model: {m.name}")
except Exception as e:
    print(f"API Error: {e}")
