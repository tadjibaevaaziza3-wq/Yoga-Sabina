'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, ImageIcon, Crop as CropIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface PhotoUploadProps {
    onUploadComplete?: (fileName: string, publicUrl: string) => void;
    maxSizeMB?: number;
    bucket?: string;
    path?: string;
    accept?: string;
    enableCrop?: boolean;
    cropAspect?: number;
}

export default function PhotoUpload({
    onUploadComplete,
    maxSizeMB = 5, // Default 5MB for photos
    bucket: propBucket,
    path: propPath,
    accept = "image/*",
    enableCrop = false,
    cropAspect
}: PhotoUploadProps) {
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

    // Crop states
    const [imgSrc, setImgSrc] = useState('');
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<any>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [isCropping, setIsCropping] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate image type
            if (!selectedFile.type.startsWith('image/')) {
                setUploadStatus({ progress: 0, status: 'error', message: 'Faqat rasm fayllarni yuklash mumkin' });
                return;
            }
            if (selectedFile.size / (1024 * 1024) > maxSizeMB) {
                setUploadStatus({ progress: 0, status: 'error', message: `Fayl juda katta (Max ${maxSizeMB}MB)` });
                return;
            }
            if (enableCrop) {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    setImgSrc(reader.result?.toString() || '');
                    setCropModalOpen(true);
                });
                reader.readAsDataURL(selectedFile);
                setFile(selectedFile); // Temp store original
            } else {
                setFile(selectedFile);
                setUploadStatus({ progress: 0, status: 'idle', message: '' });
            }
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (cropAspect) {
            const { width, height } = e.currentTarget;
            const initialCrop = centerCrop(
                makeAspectCrop({ unit: '%', width: 90 }, cropAspect, width, height),
                width,
                height
            );
            setCrop(initialCrop);
        }
    };

    const generateCroppedImage = async () => {
        if (!imgRef.current || !completedCrop || !file) return;

        setIsCropping(true);
        try {
            const canvas = document.createElement('canvas');

            // The image displayed in the browser is scaled. We need to find the scale factor.
            // ReactCrop passes crop values in percentage or pixels. We use pixels (completedCrop).
            // But those pixels are relative to the *rendered* image size.
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

            const pixelRatio = window.devicePixelRatio || 1;

            canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
            canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('No 2d context');

            ctx.scale(pixelRatio, pixelRatio);
            ctx.imageSmoothingQuality = 'high';

            const cropX = completedCrop.x * scaleX;
            const cropY = completedCrop.y * scaleY;
            const cropWidth = completedCrop.width * scaleX;
            const cropHeight = completedCrop.height * scaleY;

            ctx.drawImage(
                imgRef.current,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            canvas.toBlob((blob) => {
                if (!blob) throw new Error('Canvas is empty');

                // Keep the original filename or append -cropped
                const newFileName = file.name.replace(/\.[^/.]+$/, "") + "-cropped.jpg";
                const croppedFile = new File([blob], newFileName, { type: 'image/jpeg' });

                console.log('Cropped File created:', croppedFile.name, 'Size:', croppedFile.size, 'Type:', croppedFile.type);

                setFile(croppedFile);
                setCropModalOpen(false);
                setUploadStatus({ progress: 0, status: 'idle', message: '' });
                setIsCropping(false);
            }, 'image/jpeg', 0.95);
        } catch (e) {
            console.error('Crop failed', e);
            setIsCropping(false);
        }
    };

    const uploadPhoto = async () => {
        if (!file) return;

        setUploadStatus({ progress: 0, status: 'uploading', message: 'Yuklanmoqda...' });

        try {
            const formData = new FormData();
            formData.append('file', file);
            if (propPath) formData.append('path', propPath);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/admin/assets/upload', true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadStatus({ progress: percentComplete, status: 'uploading', message: `Yuklanmoqda: ${percentComplete}%` });
                }
            };

            xhr.onload = () => {
                console.log('Upload XHR Status:', xhr.status, xhr.responseText);
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.url) {
                            setUploadStatus({ progress: 100, status: 'success', message: 'Muvaffaqiyatli yuklandi!' });
                            if (onUploadComplete) onUploadComplete(file.name, response.url);
                            setFile(null);
                        } else {
                            throw new Error(response.error || 'Upload failed');
                        }
                    } catch (e) {
                        setUploadStatus({ progress: 0, status: 'error', message: 'Server javobi xato' });
                    }
                } else {
                    setUploadStatus({ progress: 0, status: 'error', message: 'Server xatosi: ' + xhr.status });
                }
            };

            xhr.onerror = () => {
                setUploadStatus({ progress: 0, status: 'error', message: 'Tarmoq xatosi' });
            };

            xhr.send(formData);

        } catch (error: any) {
            setUploadStatus({ progress: 0, status: 'error', message: error.message });
        }
    };

    return (
        <div className="w-full bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-soft">
            <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-editorial font-bold text-[var(--primary)] text-emerald-900">Tasvir Yuklash</h3>
                        <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Secure GCS Image Upload</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                </div>

                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group border-2 border-dashed border-emerald-100 rounded-3xl p-12 text-center hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer"
                    >
                        <Upload className="w-10 h-10 mx-auto mb-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-emerald-900">Faylni tanlang</p>
                        <p className="text-[10px] text-[var(--accent)] mt-2 uppercase tracking-widest font-medium">Rasm (Max {maxSizeMB}MB)</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 rounded-3xl p-6 flex items-center justify-between border border-emerald-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <ImageIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-900 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-[9px] text-[var(--accent)] uppercase tracking-widest font-black">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={() => setFile(null)} className="p-2 hover:bg-white rounded-lg transition-colors text-emerald-600">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {/* React Image Crop Modal */}
                <AnimatePresence>
                    {cropModalOpen && !!imgSrc && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        >
                            <div className="bg-white rounded-[2rem] p-6 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="text-xl font-editorial font-bold text-[#114539]">Rasmni Qirqish</h3>
                                        <p className="text-[10px] uppercase font-bold text-[#114539]/40 tracking-widest mt-1">Kerakli qismini tanlang</p>
                                    </div>
                                    <button onClick={() => { setCropModalOpen(false); setFile(null); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto bg-black/5 rounded-xl border border-gray-100 flex items-center justify-center p-4">
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={cropAspect}
                                    >
                                        <img
                                            ref={imgRef}
                                            src={imgSrc}
                                            alt="Crop me"
                                            className="max-h-[60vh] object-contain"
                                            onLoad={onImageLoad}
                                        />
                                    </ReactCrop>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => { setCropModalOpen(false); setFile(null); }}
                                        className="px-6 py-3 rounded-2xl text-sm font-bold border border-gray-200 hover:bg-gray-50 text-gray-600"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={generateCroppedImage}
                                        disabled={isCropping || !completedCrop?.width || !completedCrop?.height}
                                        className="px-8 py-3 rounded-2xl bg-[#114539] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#114539]/90 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isCropping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CropIcon className="w-4 h-4" />}
                                        Qirqishni tasdiqlash
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                    uploadStatus.status === 'error' ? 'text-rose-500' : 'text-emerald-600'
                                    }`}>
                                    {uploadStatus.message}
                                </span>
                                {uploadStatus.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
                                {uploadStatus.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                {uploadStatus.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                            </div>

                            <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden mt-3">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadStatus.progress}%` }}
                                    className={`h-full ${uploadStatus.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {file && uploadStatus.status === 'idle' && !cropModalOpen && (
                    <button
                        onClick={uploadPhoto}
                        className="w-full py-4 text-[10px] uppercase font-black tracking-[0.2em] rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                    >
                        YUKLASHNI TUGATISH
                    </button>
                )}
            </div>
        </div >
    );
}
