'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Video, FileText, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoUploadProps {
    onUploadComplete?: (fileName: string, publicUrl: string) => void;
    maxSizeMB?: number;
    bucket?: string;
    path?: string;
    accept?: string;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export default function VideoUpload({
    onUploadComplete,
    maxSizeMB = 5000, // 5GB default
    bucket: propBucket,
    path: propPath,
    accept = "video/*",
    title = "Video Pipeline",
    subtitle = "Secure GCS Direct Upload",
    icon = <Video className="w-6 h-6" />
}: VideoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<{
        progress: number;
        status: 'idle' | 'uploading' | 'success' | 'error';
        message: string;
    }>({
        progress: 0,
        status: 'idle',
        message: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // We removed strict video/* check because we use it for audio/files too, but we can do a loose check if accept is video/*
            if (accept === "video/*" && !selectedFile.type.startsWith('video/')) {
                setUploadStatus({ progress: 0, status: 'error', message: 'Faqat video fayllarni yuklash mumkin' });
                return;
            }
            if (accept === "audio/*" && !selectedFile.type.startsWith('audio/')) {
                setUploadStatus({ progress: 0, status: 'error', message: 'Faqat audio fayllarni yuklash mumkin' });
                return;
            }
            if (selectedFile.size / (1024 * 1024) > maxSizeMB) {
                setUploadStatus({ progress: 0, status: 'error', message: `Fayl juda katta (Max ${maxSizeMB}MB)` });
                return;
            }
            setFile(selectedFile);
            setUploadStatus({ progress: 0, status: 'idle', message: '' });
        }
    };

    const uploadVideo = async () => {
        if (!file) return;

        setUploadStatus({ progress: 0, status: 'uploading', message: 'Signed URL olinmoqda...' });

        try {
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            // 1. Get Signed URL
            const res = await fetch('/api/admin/videos/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName,
                    contentType: file.type,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload URL xatosi');
            }

            const { url, publicUrl } = await res.json();

            // 2. Upload to GCS using XHR to track progress
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('Content-Type', file.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadStatus({ progress: percentComplete, status: 'uploading', message: `Yuklanmoqda: ${percentComplete}%` });
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    setUploadStatus({ progress: 100, status: 'success', message: 'Muvaffaqiyatli yuklandi!' });
                    if (onUploadComplete) onUploadComplete(fileName, publicUrl);
                    setFile(null);
                } else {
                    setUploadStatus({ progress: 0, status: 'error', message: 'Cloud xatosi' });
                }
            };

            xhr.onerror = () => {
                setUploadStatus({ progress: 0, status: 'error', message: 'Tarmoq xatosi' });
            };

            xhr.send(file);

        } catch (error: any) {
            setUploadStatus({ progress: 0, status: 'error', message: error.message });
        }
    };

    return (
        <div className="w-full bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-soft">
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-editorial font-bold text-[var(--primary)]">{title}</h3>
                        <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">{subtitle}</p>
                    </div>
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center text-[var(--primary)]">
                        {icon}
                    </div>
                </div>

                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group border-2 border-dashed border-[var(--primary)]/10 rounded-3xl p-12 text-center hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all cursor-pointer"
                    >
                        <Upload className="w-10 h-10 mx-auto mb-4 text-[var(--primary)]/40 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-[var(--primary)]">Faylni tanlang</p>
                        <p className="text-[10px] text-[var(--accent)] mt-2 uppercase tracking-widest font-medium">Fayl (Max {maxSizeMB}MB)</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--primary)]/5 rounded-3xl p-6 flex items-center justify-between border border-[var(--primary)]/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Upload className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[var(--primary)] truncate max-w-[200px]">{file.name}</p>
                                <p className="text-[9px] text-[var(--accent)] uppercase tracking-widest font-black">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={() => setFile(null)} className="p-2 hover:bg-white rounded-lg transition-colors text-[var(--accent)]">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                <AnimatePresence>
                    {uploadStatus.status !== 'idle' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 pt-4 border-t border-[var(--border)]"
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${uploadStatus.status === 'success' ? 'text-emerald-500' :
                                    uploadStatus.status === 'error' ? 'text-rose-500' : 'text-[var(--primary)]'
                                    }`}>
                                    {uploadStatus.message}
                                </span>
                                {uploadStatus.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />}
                                {uploadStatus.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                {uploadStatus.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                            </div>

                            <div className="w-full bg-[var(--primary)]/5 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${uploadStatus.status === 'error' ? 'bg-rose-500' : 'bg-[var(--primary)]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadStatus.progress}%` }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {file && uploadStatus.status !== 'uploading' && uploadStatus.status !== 'success' && (
                    <button
                        onClick={uploadVideo}
                        className="w-full btn-luxury py-5 text-[11px] font-bold uppercase tracking-[0.4em] shadow-button active:scale-[0.98] transition-all"
                    >
                        START UPLOAD
                    </button>
                )}
            </div>
        </div>
    );
}
