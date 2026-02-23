import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    ReferenceField,
    DateField,
    FunctionField,
    UrlField
} from 'react-admin';
import { Box, Typography, Divider, Paper, Chip } from '@mui/material';

const ShowTitle = () => {
    return <span>Dars tafsilotlari</span>;
};

export const LessonShow = () => (
    <Show title={<ShowTitle />}>
        <SimpleShowLayout sx={{ '&.RaSimpleShowLayout-root': { padding: 0, backgroundColor: 'transparent', boxShadow: 'none' } }}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '5fr 7fr' }} gap={4} width="100%">
                {/* Chap ustun: Tafsilotlar */}
                <Box>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', height: '100%' }}>
                        <Typography variant="h4" sx={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 800, color: '#114539' }} gutterBottom>
                            <TextField source="title" />
                        </Typography>

                        <Box display="flex" gap={1} mb={3}>
                            <FunctionField render={(record: any) => (
                                <Chip label={record?.isFree ? 'Bepul' : 'Pullik'} color={record?.isFree ? 'success' : 'default'} size="small" variant="outlined" />
                            )} />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box display="flex" flexDirection="column" gap={2}>
                            <ReferenceField source="courseId" reference="courses" label="Kurs" link="show">
                                <TextField source="title" sx={{ fontWeight: 700, color: 'primary.main' }} />
                            </ReferenceField>
                            <NumberField source="order" label="Tartib raqami" />
                            <NumberField source="duration" label="Davomiylik (s)" emptyText="—" />
                            <TextField source="description" label="Tavsif" emptyText="Tavsif yo'q" sx={{ whiteSpace: 'pre-wrap' }} />
                            <TextField source="searchKeywords" label="Qidiruv kalit so'zlari" emptyText="—" />
                        </Box>
                    </Paper>
                </Box>

                {/* O'ng ustun: Media va fayllar */}
                <Box display="flex" flexDirection="column" gap={4}>
                    {/* Media */}
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
                        <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>Media fayllari</Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Box display="flex" flexDirection="column" gap={2}>
                            <FunctionField
                                label="Video"
                                render={(record: any) => record?.videoUrl ? (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip label="🎥 Video" size="small" color="primary" variant="outlined" />
                                        <Typography variant="caption" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {record.videoUrl}
                                        </Typography>
                                    </Box>
                                ) : <Typography variant="body2" color="textSecondary">Video yuklanmagan</Typography>}
                            />

                            <FunctionField
                                label="Audio"
                                render={(record: any) => record?.audioUrl ? (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip label="🎵 Audio" size="small" color="secondary" variant="outlined" />
                                        <Typography variant="caption" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {record.audioUrl}
                                        </Typography>
                                    </Box>
                                ) : <Typography variant="body2" color="textSecondary">Audio yuklanmagan</Typography>}
                            />

                            <FunctionField
                                label="Muqova"
                                render={(record: any) => record?.thumbnailUrl ? (
                                    <Box>
                                        <Chip label="📷 Muqova" size="small" variant="outlined" sx={{ mb: 1 }} />
                                        <Box sx={{ width: 200, height: 112, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(17,69,57,0.1)' }}>
                                            <img src={record.thumbnailUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Box>
                                    </Box>
                                ) : <Typography variant="body2" color="textSecondary">Muqova yo'q</Typography>}
                            />
                        </Box>
                    </Paper>

                    {/* Fayllar */}
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
                        <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>Hujjatlar va kontent</Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Box display="flex" flexDirection="column" gap={2}>
                            <FunctionField
                                label="PDF/PPT"
                                render={(record: any) => record?.pdfUrl ? (
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip label="📄 Hujjat" size="small" variant="outlined" />
                                        <a href={record.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#114539', fontSize: '0.875rem' }}>
                                            Yuklab olish
                                        </a>
                                    </Box>
                                ) : <Typography variant="body2" color="textSecondary">Hujjat yuklanmagan</Typography>}
                            />

                            <FunctionField
                                label="Matn"
                                render={(record: any) => record?.content ? (
                                    <Box>
                                        <Chip label="📝 Matn" size="small" variant="outlined" sx={{ mb: 1 }} />
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', p: 2, bgcolor: '#f8faf8', borderRadius: 2 }}>
                                            {record.content.substring(0, 500)}{record.content.length > 500 ? '...' : ''}
                                        </Typography>
                                    </Box>
                                ) : <Typography variant="body2" color="textSecondary">Matn yo'q</Typography>}
                            />
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </SimpleShowLayout>
    </Show>
);
