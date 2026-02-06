# AI Video Motion Editor MVP

This is the Minimal Viable Product (MVP) of the AI Video Motion Editing system.

## 🚀 Getting Started

### 1. Backend (API & Worker)

The backend handles video uploads and simulates the AI processing pipeline.

```bash
cd backend
pip install -r requirements.txt
python main.py
```

_The server will run on http://localhost:8000_

### 2. Frontend (Web Interface)

The frontend allows you to upload videos and view results.

```bash
cd frontend
npm run dev
```

_The app will run on http://localhost:3000_

## 📁 Structure

- **backend/**: FastAPI application, `main.py` entry point.
- **frontend/**: Next.js application.
- **storage/**: Local directory for saving uploads and processed videos.

## ⚠️ Notes

- This MVP "simulates" the GPU processing time (sleeps) to demonstrate the architecture without needing a 40GB+ VRAM GPU setup immediately.
- The "Processed" video will just be a copy of the original in this MVP version.
