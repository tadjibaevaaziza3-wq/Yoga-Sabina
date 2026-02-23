"use client";

import {
    Create, TextInput, NumberInput, BooleanInput, ReferenceInput, SelectInput, TabbedForm, FormTab
} from 'react-admin';
import { Box, Typography, Divider, Alert } from '@mui/material';
import { TranslatableTextInput } from '../inputs/TranslatableTextInput';
import { GcsVideoInput } from '../inputs/GcsVideoInput';
import { GcsFileInput } from '../inputs/GcsFileInput';
import { GcsImageInput } from '../inputs/GcsImageInput';

export const LessonCreate = () => (
    <Create title={<span>Yangi dars qo'shish</span>} redirect="show">
        <TabbedForm sx={{
            '& .RaTabbedForm-content': {
                backgroundColor: 'background.paper', borderRadius: '0 0 14px 14px',
                padding: '24px', boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)', mt: 0
            },
            '& .MuiTabs-root': {
                backgroundColor: 'background.paper', borderRadius: '14px 14px 0 0',
                borderBottom: '1px solid rgba(17, 69, 57, 0.08)', px: 2, pt: 1
            }
        }}>
            <FormTab label="Asosiy">
                <ReferenceInput source="courseId" reference="courses">
                    <SelectInput optionText="title" fullWidth label="Kurs (papka)" />
                </ReferenceInput>
                <TranslatableTextInput sourceUz="title" sourceRu="titleRu" labelUz="Sarlavha (UZ)" labelRu="Sarlavha (RU)" />
                <TranslatableTextInput sourceUz="description" sourceRu="descriptionRu" labelUz="Tavsif (UZ)" labelRu="Tavsif (RU)" multiline rows={4} />
                <Box display="flex" gap={2} width="100%">
                    <NumberInput source="order" label="Tartib raqami" fullWidth defaultValue={0} />
                    <NumberInput source="duration" label="Davomiylik (soniya)" fullWidth />
                </Box>
                <TextInput source="searchKeywords" label="Qidiruv kalit so'zlari" fullWidth helperText="Vergul bilan ajrating" />
                <BooleanInput source="isFree" label="Bepul dars (ko'rish mumkin)" defaultValue={false} />
            </FormTab>
            <FormTab label="Media">
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(17,69,57,0.04)' }}>
                    Video va audio alohida yuklang
                </Alert>
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>🎥 Video</Typography>
                <Divider sx={{ mb: 2 }} />
                <GcsVideoInput source="videoUrl" label="Video fayl" />
                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>🎵 Audio</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <GcsFileInput source="audioUrl" label="Audio fayl" accept="audio/*" icon="audio" maxSizeMB={100} />
                </Box>
                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>📷 Muqova rasmi</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <GcsImageInput source="thumbnailUrl" label="Dars muqovasi" bucket="assets" pathPrefix="lessons/thumbs" aspectRatio={16 / 9} />
                </Box>
            </FormTab>
            <FormTab label="Fayllar">
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>📄 Hujjatlar</Typography>
                <Divider sx={{ mb: 2 }} />
                <GcsFileInput source="pdfUrl" label="PDF / PPT fayl" accept=".pdf,.pptx,.ppt,.doc,.docx" icon="document" maxSizeMB={50} />
                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>📝 Matnli kontent</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TextInput source="content" label="Dars matni (ixtiyoriy)" fullWidth multiline rows={8} />
                </Box>
            </FormTab>
        </TabbedForm>
    </Create>
);
