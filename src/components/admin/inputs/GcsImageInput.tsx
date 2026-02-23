"use client";

import React, { useState, useCallback } from 'react';
import { useInput, InputProps } from 'react-admin';
import {
    Box, Button, CircularProgress, Typography, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Slider
} from '@mui/material';
import Image from 'next/image';
import { Trash2, UploadCloud, Crop, ZoomIn } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface GcsImageInputProps extends InputProps {
    bucket?: string;
    pathPrefix?: string;
    aspectRatio?: number; // e.g. 16/9, 1, 4/3
}

// Utility: create a cropped image blob from canvas
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
        }, 'image/jpeg', 0.92);
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (err) => reject(err));
        img.crossOrigin = 'anonymous';
        img.src = url;
    });
}

export const GcsImageInput = (props: GcsImageInputProps) => {
    const { bucket = 'assets', pathPrefix = '', source, aspectRatio = 16 / 9 } = props;
    const { field } = useInput({ source });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crop state
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // Step 1: User picks a file → open crop dialog
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = ''; // reset so same file can be re-selected

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCropDialogOpen(true);
        };
        reader.readAsDataURL(file);
    };

    // Step 2: User confirms crop → crop + upload
    const handleCropConfirm = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setCropDialogOpen(false);
        setUploading(true);
        setError(null);

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const formData = new FormData();
            formData.append('file', croppedBlob, 'cropped.jpg');
            formData.append('bucket', bucket);
            formData.append('path', pathPrefix);

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Rasmni yuklashda xatolik');
            }

            const data = await res.json();
            field.onChange(data.file.publicUrl);
        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.message || 'Yuklash amalga oshmadi');
        } finally {
            setUploading(false);
            setImageSrc(null);
        }
    };

    const handleCropCancel = () => {
        setCropDialogOpen(false);
        setImageSrc(null);
    };

    const handleRemove = () => {
        field.onChange(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="textSecondary">{props.label || source}</Typography>

            {field.value ? (
                <Box sx={{ position: 'relative', width: '200px', height: '140px', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(17, 69, 57, 0.15)' }}>
                    <Image src={field.value} alt="Preview" fill style={{ objectFit: 'cover' }} unoptimized />
                    <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                        <IconButton size="small" onClick={handleRemove} color="error" sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, mr: 0.5 }}>
                            <Trash2 size={16} />
                        </IconButton>
                    </Box>
                    {/* Re-crop: pick a new file */}
                    <Box sx={{ position: 'absolute', bottom: 5, right: 5 }}>
                        <Button
                            variant="contained"
                            component="label"
                            size="small"
                            startIcon={<Crop size={14} />}
                            sx={{ bgcolor: 'rgba(17,69,57,0.85)', fontSize: '0.65rem', py: 0.3, px: 1, '&:hover': { bgcolor: '#114539' }, minWidth: 'auto' }}
                        >
                            Almashtirish
                            <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <UploadCloud size={20} />}
                        sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#1a6b56' } }}
                    >
                        {uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}
                        <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                    </Button>
                    <Typography variant="caption" color="textSecondary">
                        Maks 5MB. JPEG, PNG, WEBP.
                    </Typography>
                </Box>
            )}

            {error && <Typography color="error" variant="caption">{error}</Typography>}

            {/* Crop Dialog */}
            <Dialog
                open={cropDialogOpen}
                onClose={handleCropCancel}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                    }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#114539', color: '#fff', fontWeight: 700 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Crop size={20} />
                        Rasmni kesish
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0, position: 'relative', height: 450, bgcolor: '#1a1a1a' }}>
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            style={{
                                containerStyle: { height: '100%' },
                            }}
                        />
                    )}
                </DialogContent>
                <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f8faf8' }}>
                    <ZoomIn size={18} />
                    <Typography variant="caption" sx={{ minWidth: 60 }}>Kattalashtirish</Typography>
                    <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.05}
                        onChange={(_, v) => setZoom(v as number)}
                        sx={{
                            color: '#114539',
                            '& .MuiSlider-thumb': { width: 20, height: 20 },
                        }}
                    />
                </Box>
                <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8faf8', borderTop: '1px solid rgba(17,69,57,0.08)' }}>
                    <Button onClick={handleCropCancel} sx={{ color: '#5a6b5a' }}>
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={handleCropConfirm}
                        variant="contained"
                        startIcon={<Crop size={16} />}
                        sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#1a6b56' } }}
                    >
                        Kesish va yuklash
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
