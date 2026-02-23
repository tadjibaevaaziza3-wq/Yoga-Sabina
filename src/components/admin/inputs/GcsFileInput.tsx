"use client";

import React, { useState } from 'react';
import { useInput, InputProps } from 'react-admin';
import { Box, Button, CircularProgress, Typography, IconButton, LinearProgress } from '@mui/material';
import { Trash2, Upload, FileText, Music, FileSpreadsheet } from 'lucide-react';

interface GcsFileInputProps extends InputProps {
    accept?: string;      // e.g. "audio/*", ".pdf,.pptx,.ppt,.doc,.docx"
    icon?: 'audio' | 'document' | 'file';
    maxSizeMB?: number;
}

const iconMap = {
    audio: Music,
    document: FileText,
    file: FileSpreadsheet,
};

export const GcsFileInput = (props: GcsFileInputProps) => {
    const { source, accept = '*/*', icon = 'file', maxSizeMB = 50 } = props;
    const { field } = useInput({ source });
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const Icon = iconMap[icon] || Upload;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Fayl hajmi ${maxSizeMB}MB dan oshmasligi kerak`);
            return;
        }

        setUploading(true);
        setError(null);
        setProgress(0);
        setFileName(file.name);

        try {
            // Determine content type
            const contentType = file.type || 'application/octet-stream';
            const isAudio = contentType.startsWith('audio/');

            // Get signed upload URL
            const resUrl = await fetch('/api/admin/videos/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType,
                })
            });

            if (!resUrl.ok) {
                const data = await resUrl.json();
                throw new Error(data.error || 'Yuklash URL olishda xatolik');
            }

            const { url, publicUrl } = await resUrl.json();

            // Upload via XHR for progress tracking
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', url, true);
                xhr.setRequestHeader('Content-Type', contentType);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setProgress(Math.round((event.loaded / event.total) * 100));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
                    else reject(new Error(`Yuklash xatosi: ${xhr.status}`));
                };

                xhr.onerror = () => reject(new Error('Tarmoq xatosi'));
                xhr.send(file);
            });

            field.onChange(publicUrl);
        } catch (err: any) {
            console.error('File Upload Error:', err);
            setError(err.message || 'Yuklash amalga oshmadi');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleRemove = () => {
        field.onChange(null);
        setFileName(null);
    };

    // Extract file name from URL
    const displayName = fileName || (field.value ? decodeURIComponent(field.value.split('/').pop() || '') : '');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
            <Typography variant="body2" color="textSecondary" fontWeight={500}>{props.label || source}</Typography>

            {field.value ? (
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    p: 2, border: '1px solid rgba(17,69,57,0.15)',
                    borderRadius: 2, width: 'fit-content', bgcolor: '#f8faf8'
                }}>
                    <Icon size={22} color="#114539" />
                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
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
                            startIcon={uploading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Icon size={18} />}
                            sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#1a6b56' }, textTransform: 'none' }}
                        >
                            {uploading ? 'Yuklanmoqda...' : 'Fayl yuklash'}
                            <input type="file" hidden accept={accept} onChange={handleFileChange} />
                        </Button>
                        <Typography variant="caption" color="textSecondary">
                            Maks {maxSizeMB}MB
                        </Typography>
                    </Box>

                    {uploading && progress > 0 && (
                        <Box sx={{ width: '100%', maxWidth: 300 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="textSecondary">{fileName}</Typography>
                                <Typography variant="caption" fontWeight={600}>{progress}%</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(17,69,57,0.08)', '& .MuiLinearProgress-bar': { bgcolor: '#114539' } }}
                            />
                        </Box>
                    )}
                </Box>
            )}

            {error && <Typography color="error" variant="caption">{error}</Typography>}
        </Box>
    );
};
