FROM python:3.11-slim

WORKDIR /workspace

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy dependency definition
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source files
COPY app/ ./app/

# Expose FastAPI port
EXPOSE 8000

# Execute server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
