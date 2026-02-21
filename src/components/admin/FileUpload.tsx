'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, FileText, FileAudio, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
    onUploadComplete?: (fileName: string, publicUrl: string) => void;
    maxSizeMB?: number;
    bucket?: string;
    path?: string;
    accept?: string;
    label?: string;
}

export default function FileUpload({
    onUploadComplete,
    maxSizeMB = 50,
    bucket = 'assets',
    path = 'uploads',
    accept = '*/*',
    label = 'Fayl yuklash'
}: FileUploadProps) {
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
            if (selectedFile.size / (1024 * 1024) > maxSizeMB) {
                setUploadStatus({ progress: 0, status: 'error', message: `Fayl juda katta (Max ${maxSizeMB}MB)` });
                return;
            }
            setFile(selectedFile);
            setUploadStatus({ progress: 0, status: 'idle', message: '' });
            uploadFile(selectedFile);
        }
    };

    const uploadFile = async (fileToUpload: File) => {
        setUploadStatus({ progress: 0, status: 'uploading', message: 'Tayyorlanmoqda...' });

        try {
            const fileNameToSave = `${path}/${Date.now()}-${fileToUpload.name.replace(/\s+/g, '-')}`;

            // 1. Get Signed URL
            const res = await fetch('/api/admin/assets/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: fileNameToSave,
                    contentType: fileToUpload.type,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Upload URL xatosi');
            }

            const { url, publicUrl } = await res.json();

            // 2. Upload to GCS
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('Content-Type', fileToUpload.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadStatus({ progress: percentComplete, status: 'uploading', message: `${percentComplete}%` });
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    setUploadStatus({ progress: 100, status: 'success', message: 'OK' });
                    if (onUploadComplete) onUploadComplete(fileToUpload.name, publicUrl);
                } else {
                    setUploadStatus({ progress: 0, status: 'error', message: 'Xatolik' });
                }
            };

            xhr.onerror = () => {
                setUploadStatus({ progress: 0, status: 'error', message: 'Tarmoq' });
            };

            xhr.send(fileToUpload);

        } catch (error: any) {
            setUploadStatus({ progress: 0, status: 'error', message: error.message });
        }
    };

    const getIcon = () => {
        if (file?.type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
        if (file?.type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
        return <FileText className="w-5 h-5" />;
    };

    return (
        <div className="w-full bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
            <div className="p-4 flex items-center gap-4">
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed border-[var(--border)] rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--secondary)] transition-all"
                    >
                        <Upload className="w-4 h-4 opacity-50" />
                        <span className="text-xs font-bold opacity-60">{label}</span>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-between bg-[var(--secondary)]/30 rounded-lg p-2 px-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {getIcon()}
                            <span className="text-xs font-bold truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {(uploadStatus.status === 'idle' || uploadStatus.status === 'error') && (
                                <button onClick={() => file && uploadFile(file)} className="text-[10px] bg-[var(--primary)] text-white px-2 py-1 rounded font-bold uppercase">
                                    {uploadStatus.status === 'error' ? 'Qayta urinish' : 'Yuklash'}
                                </button>
                            )}
                            {uploadStatus.status === 'uploading' && (
                                <span className="text-[10px] font-mono">{uploadStatus.progress}%</span>
                            )}
                            {uploadStatus.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            <button onClick={() => setFile(null)} className="p-1 hover:bg-white/20 rounded"><X className="w-3 h-3" /></button>
                        </div>
                    </div>
                )}
            </div>
            {uploadStatus.message && uploadStatus.status === 'error' && (
                <div className="bg-red-500/10 p-2 text-[10px] text-red-500 text-center font-bold">
                    {uploadStatus.message}
                </div>
            )}
        </div>
    );
}
