import {
    Edit,
    TextInput,
    NumberInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    useRecordContext,
    TabbedForm,
    FormTab
} from 'react-admin';
import { Box, Typography, Divider, Alert } from '@mui/material';
import { TranslatableTextInput } from '../inputs/TranslatableTextInput';
import { GcsVideoInput } from '../inputs/GcsVideoInput';
import { GcsFileInput } from '../inputs/GcsFileInput';
import { GcsImageInput } from '../inputs/GcsImageInput';

const EditTitle = () => {
    const record = useRecordContext();
    return <span>Darsni tahrirlash {record ? `"${record.title}"` : ''}</span>;
};

export const LessonEdit = () => (
    <Edit title={<EditTitle />} redirect="show">
        <TabbedForm sx={{
            '& .RaTabbedForm-content': {
                backgroundColor: 'background.paper',
                borderRadius: '0 0 14px 14px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
                mt: 0
            },
            '& .MuiTabs-root': {
                backgroundColor: 'background.paper',
                borderRadius: '14px 14px 0 0',
                borderBottom: '1px solid rgba(17, 69, 57, 0.08)',
                px: 2,
                pt: 1
            }
        }}>
            {/* Tab 1: Asosiy ma'lumotlar */}
            <FormTab label="Asosiy">
                <ReferenceInput source="courseId" reference="courses">
                    <SelectInput optionText="title" fullWidth label="Kurs (papka)" />
                </ReferenceInput>

                <TranslatableTextInput sourceUz="title" sourceRu="titleRu" labelUz="Sarlavha (UZ)" labelRu="Sarlavha (RU)" />
                <TranslatableTextInput sourceUz="description" sourceRu="descriptionRu" labelUz="Tavsif (UZ)" labelRu="Tavsif (RU)" multiline rows={4} />

                <Box display="flex" gap={2} width="100%">
                    <NumberInput source="order" label="Tartib raqami" fullWidth />
                    <NumberInput source="duration" label="Davomiylik (soniya)" fullWidth helperText="Video uzunligi" />
                </Box>

                <TextInput
                    source="searchKeywords"
                    label="Qidiruv kalit so'zlari"
                    fullWidth
                    helperText="Vergul bilan ajrating: yoga, nafas olish, meditatsiya"
                />

                <Box display="flex" gap={2} width="100%">
                    <BooleanInput source="isFree" label="Bepul dars (ko'rish mumkin)" />
                </Box>
            </FormTab>

            {/* Tab 2: Media — Video, Audio, Thumbnail */}
            <FormTab label="Media">
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(17,69,57,0.04)', '& .MuiAlert-icon': { color: '#114539' } }}>
                    Video va audio alohida yuklang — foydalanuvchi ularning ovozini mustaqil boshqarishi mumkin.
                </Alert>

                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>🎥 Video</Typography>
                <Divider sx={{ mb: 2 }} />
                <GcsVideoInput source="videoUrl" label="Video fayl" />

                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>🎵 Audio</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <GcsFileInput source="audioUrl" label="Audio fayl (meditatsiya, musiqa)" accept="audio/*" icon="audio" maxSizeMB={100} />
                </Box>

                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>📷 Muqova rasmi</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <GcsImageInput source="thumbnailUrl" label="Dars muqovasi" bucket="assets" pathPrefix="lessons/thumbs" aspectRatio={16 / 9} />
                </Box>
            </FormTab>

            {/* Tab 3: Fayllar — PDF, PPT, matnli kontent */}
            <FormTab label="Fayllar">
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>📄 Hujjatlar</Typography>
                <Divider sx={{ mb: 2 }} />
                <GcsFileInput
                    source="pdfUrl"
                    label="PDF / PPT fayl"
                    accept=".pdf,.pptx,.ppt,.doc,.docx"
                    icon="document"
                    maxSizeMB={50}
                />

                <Box mt={4}>
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>📝 Matnli kontent</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TextInput
                        source="content"
                        label="Dars matni (ixtiyoriy)"
                        fullWidth
                        multiline
                        rows={8}
                        helperText="Dars haqida batafsil ma'lumot, ko'rsatmalar yoki transkriptsiya"
                    />
                </Box>
            </FormTab>
        </TabbedForm>
    </Edit>
);
