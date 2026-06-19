import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("d:\\NAM3\\HK2\\Điện Toán Đám Mây\\ev-project-test (1)\\ev-project-test\\ev-service-center-backend\\ai-chat-service\\.env")

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing API Key starting with: {api_key[:10] if api_key else 'None'}...")

genai.configure(api_key=api_key)

print("Available models:")
for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(f"Embedding model: {m.name}")
    elif 'generateContent' in m.supported_generation_methods:
        print(f"Generation model: {m.name}")
