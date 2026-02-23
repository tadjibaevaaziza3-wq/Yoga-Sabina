"use client";

import React, { useState } from 'react';
import { useInput, InputProps } from 'react-admin';
import { Box, Button, CircularProgress, Typography, IconButton, LinearProgress } from '@mui/material';
import { Trash2, Video } from 'lucide-react';

interface GcsVideoInputProps extends InputProps { }

export const GcsVideoInput = (props: GcsVideoInputProps) => {
    const { source } = props;
    const { field } = useInput({ source });
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // 1. Get Signed URL
            const resUrl = await fetch('/api/admin/videos/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type || 'video/mp4'
                })
            });

            if (!resUrl.ok) {
                const data = await resUrl.json();
                throw new Error(data.error || 'Failed to get upload URL');
            }

            const { url, publicUrl } = await resUrl.json();

            // 2. Upload file directly to GCS using XHR to track progress
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', url, true);
                xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        setProgress(Math.round(percentComplete));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.send(file);
            });

            // 3. Save URL to field
            field.onChange(publicUrl);

        } catch (err: any) {
            console.error('Video Upload Error:', err);
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleRemove = () => {
        field.onChange(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="textSecondary">{props.label || source}</Typography>

            {field.value ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #114539', borderRadius: 2, width: 'fit-content' }}>
                    <Video size={24} color="#114539" />
                    <Typography variant="body2" sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {field.value}
                    </Typography>
                    <IconButton size="small" onClick={handleRemove} color="error">
                        <Trash2 size={16} />
                    </IconButton>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            component="label"
                            disabled={uploading}
                            startIcon={uploading ? <CircularProgress size={20} /> : <Video size={20} />}
                            sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a2e26' } }}
                        >
                            {uploading ? 'Yuklanmoqda...' : 'Video yuklash'}
                            <input
                                type="file"
                                hidden
                                accept="video/*"
                                onChange={handleFileChange}
                            />
                        </Button>
                        <Typography variant="caption" color="textSecondary">
                            MP4, WebM (Bulutga yuklash)
                        </Typography>
                    </Box>

                    {uploading && progress > 0 && (
                        <Box sx={{ width: '100%', maxWidth: '300px', mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption">{progress}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                    )}
                </Box>
            )}

            {error && <Typography color="error" variant="caption">{error}</Typography>}
        </Box>
    );
};
