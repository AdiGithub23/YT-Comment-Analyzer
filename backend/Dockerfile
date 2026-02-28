FROM python:3.11-slim

WORKDIR /app

# System essentials (sometimes needed for transformers/tokenizers)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#     && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU-only (This layer is huge, cache it!)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install the rest
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything
COPY ./model/final_model ./model/final_model
COPY app.py .

# App Runner default port 8080
EXPOSE 8080

# Start the server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
