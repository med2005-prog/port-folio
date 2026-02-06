import os
import shutil
import uuid
import time
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# --- Configuration ---
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../storage/uploads")
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "../storage/processed")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

app = FastAPI(title="AI Video Motion Editor MVP")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (simulating signed URLs or direct delivery for MVP)
app.mount("/storage", StaticFiles(directory="../storage"), name="storage")

# --- In-Memory State (Replace with Redis/DB later) ---
jobs = {}

class JobResponse(BaseModel):
    job_id: str
    status: str
    message: Optional[str] = None
    original_video: Optional[str] = None
    processed_video: Optional[str] = None

# --- Worker Logic (Monolithic for MVP) ---
def process_video_task(job_id: str, file_path: str, style: str):
    """
    Simulates the GPU Worker pipeline:
    1. Frame Extraction
    2. Pose Estimation
    3. Motion Representation
    4. Motion Editing
    5. Video Generation
    6. Reconstruction
    """
    try:
        print(f"[{job_id}] Starting processing with style: {style}")
        jobs[job_id]["status"] = "processing_frames"
        time.sleep(2) # Simulate FFmpeg frame extraction

        jobs[job_id]["status"] = "estimating_pose"
        time.sleep(2) # Simulate MediaPipe

        jobs[job_id]["status"] = "generating_video"
        time.sleep(5) # Simulate AnimateDiff/ControlNet

        # Just verify file exists and 'touch' a result file
        output_filename = f"{job_id}_output.mp4"
        output_path = os.path.join(PROCESSED_DIR, output_filename)
        
        # In a real app, this is where FFmpeg would stitch frames
        # For MVP, we'll just copy the original as the 'result' to prove flow
        shutil.copy(file_path, output_path)

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["processed_video"] = f"/storage/processed/{output_filename}"
        print(f"[{job_id}] Processing complete.")
        
    except Exception as e:
        print(f"[{job_id}] Error: {e}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["message"] = str(e)

# --- Endpoints ---

@app.post("/jobs", response_model=JobResponse)
async def create_job(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    style: str = "cinematic"
):
    job_id = str(uuid.uuid4())
    file_location = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "original_video": f"/storage/uploads/{job_id}_{file.filename}",
        "processed_video": None,
        "message": "Job created"
    }
    
    # Trigger processing
    background_tasks.add_task(process_video_task, job_id, file_location, style)
    
    return jobs[job_id]

@app.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
