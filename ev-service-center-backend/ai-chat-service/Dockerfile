FROM python:3.10-slim

WORKDIR /app

# Cài đặt thư viện hệ thống cần thiết cho FAISS (nếu cần)
RUN apt-get update && apt-get install -y build-essential

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Chú ý: Trong thực tế, bạn cần chạy ingest_data.py trước khi chạy app.
# Bạn có thể mount volume thư mục faiss_index từ máy host vào container.

EXPOSE 5009

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5009"]
