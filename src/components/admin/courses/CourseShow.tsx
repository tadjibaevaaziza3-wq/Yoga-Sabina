import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    ImageField,
    ReferenceManyField,
    Datagrid,
    DateField,
    FunctionField
} from 'react-admin';
import { Box, Typography, Divider, Paper, Chip } from '@mui/material';

const ShowTitle = () => {
    return <span>Kurs tafsilotlari</span>;
};

export const CourseShow = () => (
    <Show title={<ShowTitle />}>
        <SimpleShowLayout sx={{ '&.RaSimpleShowLayout-root': { padding: 0, backgroundColor: 'transparent', boxShadow: 'none' } }}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '5fr 7fr' }} gap={4} width="100%">
                {/* Chap ustun: Tafsilotlar */}
                <Box>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', height: '100%' }}>
                        <Box mb={3} display="flex" justifyContent="center">
                            <ImageField source="coverImage" sx={{ '& img': { width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: '12px' } }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 800, color: '#114539' }} gutterBottom>
                            <TextField source="title" />
                        </Typography>
                        <Box display="flex" gap={1} mb={3}>
                            <FunctionField render={(record: any) => <Chip label={record?.type === 'ONLINE' ? 'Onlayn' : 'Oflayn'} color="primary" size="small" variant="outlined" />} />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box display="flex" flexDirection="column" gap={2}>
                            <NumberField source="price" label="Narx" options={{ style: 'currency', currency: 'UZS' }} />
                            <TextField source="description" label="Tavsif" sx={{ whiteSpace: 'pre-wrap' }} />
                        </Box>
                    </Paper>
                </Box>

                {/* O'ng ustun: Darslar va sotib olishlar */}
                <Box display="flex" flexDirection="column" gap={4}>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
                        <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>Kursdagi darslar</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <ReferenceManyField reference="lessons" target="courseId" label={false}>
                            <Datagrid bulkActionButtons={false} rowClick="show">
                                <TextField source="order" label="#" />
                                <TextField source="title" label="Sarlavha" />
                                <FunctionField label="Holat" render={(record: any) => <Chip label={record?.isActive ? 'Faol' : 'Qoralama'} size="small" />} />
                            </Datagrid>
                        </ReferenceManyField>
                    </Paper>

                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
                        <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>So&apos;nggi xaridlar</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <ReferenceManyField reference="purchases" target="courseId" label={false} sort={{ field: 'createdAt', order: 'DESC' }}>
                            <Datagrid bulkActionButtons={false}>
                                <TextField source="userId" label="Foydalanuvchi ID" />
                                <TextField source="status" label="Holat" />
                                <NumberField source="amount" label="Summa" options={{ style: 'currency', currency: 'UZS' }} />
                                <DateField source="createdAt" label="Sana" />
                            </Datagrid>
                        </ReferenceManyField>
                    </Paper>
                </Box>
            </Box>
        </SimpleShowLayout>
    </Show>
);
