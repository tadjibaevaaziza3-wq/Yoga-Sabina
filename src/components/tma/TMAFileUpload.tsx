'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Loader2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TMAFileUploadProps {
    onUploadComplete: (url: string) => void;
    label?: string;
}

export default function TMAFileUpload({
    onUploadComplete,
    label = "Chek rasmini yuklang"
}: TMAFileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            uploadFile(selectedFile);
        }
    };

    const uploadFile = async (fileToUpload: File) => {
        setStatus('uploading');
        setProgress(10);

        try {
            // 1. Get Signed URL
            const res = await fetch('/api/admin/assets/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: `payments/${Date.now()}-${fileToUpload.name.replace(/\s+/g, '-')}`,
                    contentType: fileToUpload.type,
                }),
            });

            if (!res.ok) throw new Error('Upload URL error');
            const { url } = await res.json();
            setProgress(30);

            // 2. Upload to GCS
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('Content-Type', fileToUpload.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setProgress(30 + (percent * 0.6)); // Scale to 30-90%
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    const fileName = url.split('?')[0].split('/').pop();
                    const finalUrl = url.split('?')[0];
                    setStatus('success');
                    setProgress(100);
                    onUploadComplete(finalUrl);
                } else {
                    setStatus('error');
                }
            };

            xhr.onerror = () => setStatus('error');
            xhr.send(fileToUpload);

        } catch (error) {
            console.error('upload error', error);
            setStatus('error');
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {status === 'idle' || status === 'error' ? (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-[1.5rem] p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${status === 'error' ? 'border-red-200 bg-red-50' : 'border-[#114539]/10 bg-[#114539]/5 hover:bg-[#114539]/10'
                            }`}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <Upload className={`w-6 h-6 ${status === 'error' ? 'text-red-500' : 'text-[#114539]'}`} />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#114539]">{label}</p>
                            <p className="text-[8px] font-bold text-[#114539]/40 mt-1">PNG, JPG (MAX 5MB)</p>
                        </div>
                        {status === 'error' && <p className="text-[8px] text-red-500 font-bold uppercase">Xatolik yuz berdi</p>}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border border-[#114539]/10 rounded-[1.5rem] p-6 flex flex-col items-center gap-4 shadow-soft"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#114539]/5 flex items-center justify-center relative">
                            {status === 'uploading' ? (
                                <Loader2 className="w-6 h-6 text-[#114539] animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            )}
                        </div>
                        <div className="w-full space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#114539]">
                                    {status === 'uploading' ? 'Yuklanmoqda...' : 'Tayyor!'}
                                </span>
                                <span className="text-[8px] font-mono font-bold text-[#114539]/40">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#114539]/5 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${status === 'success' ? 'bg-green-500' : 'bg-[#114539]'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        {status === 'success' && (
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setStatus('idle');
                                    setProgress(0);
                                }}
                                className="text-[8px] font-black text-[#114539]/40 uppercase tracking-widest hover:text-[#114539]"
                            >
                                Faylni o'zgartirish
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
