'use client';

import { useState, useEffect, useRef } from 'react';

type JobStatus = 'idle' | 'queued' | 'processing_frames' | 'estimating_pose' | 'generating_video' | 'completed' | 'failed';

interface JobData {
  job_id: string;
  status: JobStatus;
  message?: string;
  original_video?: string;
  processed_video?: string;
}

const BACKEND_URL = 'http://127.0.0.1:8000';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<string>('cinematic');
  const [job, setJob] = useState<JobData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll for status
  useEffect(() => {
    if (!job || ['completed', 'failed', 'idle'].includes(job.status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/jobs/${job.job_id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [job]);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setJob(null);
    } else {
      alert("Please select a valid video file.");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const startJob = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    // In a real app we would send the style too, assuming the API accepts query param or form data
    // The current mock backend accepts style as query param
    try {
      const res = await fetch(`${BACKEND_URL}/jobs?style=${style}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      setJob(data);
    } catch (e) {
      alert("Error starting job: " + e);
    }
  };

  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case 'queued': return 'في الانتظار...';
      case 'processing_frames': return 'استخراج الإطارات...';
      case 'estimating_pose': return 'تحليل الذكاء الاصطناعي...';
      case 'generating_video': return 'توليد الحركة...';
      case 'completed': return 'تم!';
      case 'failed': return 'فشل';
      default: return 'انتظار';
    }
  };

  return (
    <main className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <p style={{ color: 'var(--secondary)', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 600 }}>
          مدعوم بالذكاء الاصطناعي
        </p>
        <h1>محرر حركة الفيديو</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          حول فيديوهاتك باستخدام تقنيات الذكاء الاصطناعي المتقدمة.
          ارفع مقطع فيديو، اختر النمط، ودع خوادمنا تقوم بالباقي.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Left Panel: Inputs */}
        <div className="glass-panel">
          <h2>1. رفع الفيديو</h2>
          
          <div 
            className={`upload-zone ${isDragging ? 'active' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="video/*" 
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />
            <div className="upload-icon">
              {file ? '🎬' : '📁'}
            </div>
            <p style={{ fontWeight: 600, color: 'white' }}>
              {file ? file.name : 'اضغط أو اسحب الفيديو هنا'}
            </p>
            {!file && <p style={{ fontSize: '0.8rem' }}>يدعم MP4, MOV</p>}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2>2. اختر النمط</h2>
            <div className="style-grid">
              {[
                { id: 'cinematic', label: 'سينمائي', icon: '🎥' },
                { id: 'smooth', label: 'سلس', icon: '🌊' },
                { id: 'cyberpunk', label: 'سايبر بانك', icon: '🤖' },
                { id: 'anime', label: 'أنيمي', icon: '✨' }
              ].map((item) => (
                <div 
                  key={item.id}
                  className={`style-card ${style === item.id ? 'selected' : ''}`}
                  onClick={() => setStyle(item.id)}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={startJob}
              disabled={!file || (job !== null && job.status !== 'completed' && job.status !== 'failed')}
              style={{ width: '100%', fontSize: '1.2rem', fontFamily: 'inherit' }}
            >
              {job && job.status !== 'completed' && job.status !== 'failed' ? (
                <>
                  <div className="loader"></div> جاري المعالجة...
                </>
              ) : (
                '✨ إنشاء الفيديو'
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="glass-panel">
          <h2>3. النتيجة والمعاينة</h2>
          
          {/* Status Bar */}
          {job && job.status !== 'idle' && (
            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>الحالة</span>
                <span style={{ fontWeight: 600, color: job.status === 'failed' ? '#ef4444' : 'var(--accent)' }}>
                  {getStatusLabel(job.status)}
                </span>
              </div>
              {/* Fake Progress Bar */}
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'var(--accent)', 
                  transition: 'width 0.5s ease',
                  width: 
                    job.status === 'queued' ? '10%' :
                    job.status === 'processing_frames' ? '30%' :
                    job.status === 'estimating_pose' ? '60%' :
                    job.status === 'generating_video' ? '80%' :
                    job.status === 'completed' ? '100%' : '0%'
                }}></div>
              </div>
              {job.message && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>{job.message}</p>}
            </div>
          )}

          {/* Video Players */}
          {job?.processed_video ? (
            <div>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--secondary)' }}>✨ النتيجة النهائية</p>
              <div className="video-wrapper">
                <video src={`${BACKEND_URL}${job.processed_video}`} controls autoPlay loop />
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                 <a 
                   href={`${BACKEND_URL}${job.processed_video}`} 
                   download 
                   className="btn"
                   style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }}
                 >
                   ⬇ تحميل النتيجة
                 </a>
              </div>
            </div>
          ) : previewUrl ? (
             <div>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>معاينة الفيديو الأصلي</p>
              <div className="video-wrapper">
                <video src={previewUrl} controls />
              </div>
             </div>
          ) : (
            <div style={{ 
              height: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-muted)',
              border: '2px dashed var(--border)',
              borderRadius: '16px'
            }}>
              منطقة العرض
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
