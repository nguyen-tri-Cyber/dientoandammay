import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS

# Tải biến môi trường (GEMINI_API_KEY)
load_dotenv()

def ingest_knowledge_base():
    # 1. Đọc file văn bản
    print("Đang đọc file knowledge_base.txt...")
    loader = TextLoader("knowledge_base.txt", encoding="utf-8")
    documents = loader.load()

    # 2. Cắt nhỏ văn bản (Chunking) để AI dễ đọc hơn
    print("Đang cắt nhỏ văn bản...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Đã cắt thành {len(chunks)} đoạn nhỏ.")

    # 3. Tạo Vector Embeddings bằng Google Gemini
    print("Đang tạo Vector Embeddings bằng Gemini API...")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=os.getenv("GEMINI_API_KEY"))

    # 4. Lưu vào FAISS Vector Database
    print("Đang lưu vào Vector DB (FAISS)...")
    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local("faiss_index")
    print("Hoàn tất! Hệ thống RAG đã sẵn sàng.")

if __name__ == "__main__":
    if not os.getenv("GEMINI_API_KEY"):
        print("LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env")
    else:
        ingest_knowledge_base()
