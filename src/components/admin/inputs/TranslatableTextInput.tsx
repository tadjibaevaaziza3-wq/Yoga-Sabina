"use client";

import React, { useState } from 'react';
import { TextInput, TextInputProps } from 'react-admin';
import { Box, IconButton, CircularProgress, Typography, Tooltip } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { Languages, ArrowRight } from 'lucide-react';

interface TranslatableTextInputProps extends Omit<TextInputProps, 'source'> {
    sourceUz: string;
    sourceRu: string;
    labelUz?: string;
    labelRu?: string;
}

export const TranslatableTextInput = (props: TranslatableTextInputProps) => {
    const { sourceUz, sourceRu, labelUz = "O'zbekcha", labelRu = 'Ruscha', ...rest } = props;
    const { getValues, setValue } = useFormContext();
    const [translating, setTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAutoTranslate = async () => {
        const textToTranslate = getValues(sourceUz);

        if (!textToTranslate) {
            setError("Avval o'zbekcha matnni kiriting");
            return;
        }

        setTranslating(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textToTranslate,
                    from: 'uz',
                    to: 'ru'
                })
            });

            if (!res.ok) {
                throw new Error('Tarjima xatosi');
            }

            const data = await res.json();
            if (data.success && data.translated) {
                setValue(sourceRu, data.translated, { shouldValidate: true, shouldDirty: true });
            } else {
                throw new Error('Tarjima javobida xatolik');
            }
        } catch (err: any) {
            console.error('Translation error:', err);
            setError(err.message || 'Tarjima amalga oshmadi');
        } finally {
            setTranslating(false);
        }
    };

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 1,
            alignItems: 'start',
            width: '100%',
            mb: 1,
            p: 2,
            bgcolor: 'rgba(17, 69, 57, 0.02)',
            borderRadius: 3,
            border: '1px solid rgba(17, 69, 57, 0.06)',
        }}>
            {/* UZ Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Typography variant="caption" sx={{ color: '#114539', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: -0.5, ml: 0.5 }}>
                    🇺🇿 O&apos;zbekcha
                </Typography>
                <TextInput source={sourceUz} label={labelUz} fullWidth {...rest} />
            </Box>

            {/* Translate Button Column */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pt: 3.5,
                gap: 0.5,
            }}>
                <Tooltip title={translating ? "Tarjima qilinmoqda..." : "Ruscha tarjima qilish"} arrow>
                    <IconButton
                        onClick={handleAutoTranslate}
                        disabled={translating}
                        sx={{
                            bgcolor: '#114539',
                            color: '#fff',
                            width: 40,
                            height: 40,
                            '&:hover': { bgcolor: '#1a6b56', transform: 'scale(1.1)' },
                            '&.Mui-disabled': { bgcolor: 'rgba(17, 69, 57, 0.3)', color: 'rgba(255,255,255,0.5)' },
                            transition: 'all 0.2s',
                        }}
                    >
                        {translating ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <ArrowRight size={20} />}
                    </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ color: '#5a6b5a', fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                    <Languages size={10} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                    Tarjima
                </Typography>
                {error && (
                    <Typography color="error" variant="caption" sx={{ fontSize: '0.6rem', textAlign: 'center', maxWidth: 80 }}>
                        {error}
                    </Typography>
                )}
            </Box>

            {/* RU Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Typography variant="caption" sx={{ color: '#5a6b5a', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: -0.5, ml: 0.5 }}>
                    🇷🇺 Ruscha
                </Typography>
                <TextInput source={sourceRu} label={labelRu} fullWidth {...rest} />
            </Box>
        </Box>
    );
};
