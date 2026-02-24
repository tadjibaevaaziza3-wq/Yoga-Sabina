"use client";

import {
    List, Datagrid, TextField, DateField, NumberField,
    ShowButton, EditButton, Show, SimpleShowLayout, FunctionField,
    Edit, Create, SimpleForm, TextInput, NumberInput, SelectInput, BooleanInput,
    ReferenceField
} from 'react-admin';
import { Box, Typography, Divider, Paper, Chip, Alert } from '@mui/material';
import { TranslatableTextInput } from '../inputs/TranslatableTextInput';
import { GcsImageInput } from '../inputs/GcsImageInput';

// ── Status helpers ──
const statusColors: Record<string, string> = {
    PENDING: '#d97706',
    COMPLETED: '#16a34a',
    CANCELED: '#dc2626',
    CONFIRMED: '#0a8069',
    SCHEDULED: '#2563eb',
};

const statusLabels: Record<string, string> = {
    PENDING: 'Kutilmoqda',
    COMPLETED: 'Yakunlangan',
    CANCELED: 'Bekor qilingan',
    CONFIRMED: 'Tasdiqlangan',
    SCHEDULED: 'Rejalashtirilgan',
};

// ── Consultation List ──
export const ConsultationList = () => (
    <List
        sort={{ field: 'createdAt', order: 'DESC' }}
        filter={{ productType: 'CONSULTATION' }}
        sx={{
            '& .RaList-main': {
                backgroundColor: 'background.paper',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
            }
        }}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="title" label="Nomi" />
            <FunctionField
                label="Format"
                render={(record: any) => {
                    const fmt = record?.consultationFormat || '—';
                    const labels: Record<string, string> = {
                        ONLINE: 'Onlayn',
                        OFFLINE: 'Oflayn',
                        HYBRID: 'Aralash',
                    };
                    return <Chip label={labels[fmt] || fmt} size="small" variant="outlined" />;
                }}
            />
            <NumberField source="price" label="Narx" options={{ style: 'currency', currency: 'UZS' }} />
            <FunctionField
                label="Ko'rinish"
                render={(record: any) => (
                    <Chip
                        label={record?.isActive ? 'Ko\'rinadi' : 'Yashirin'}
                        size="small"
                        sx={{
                            bgcolor: record?.isActive ? 'rgba(17,69,57,0.08)' : 'rgba(200,50,50,0.08)',
                            color: record?.isActive ? '#114539' : '#dc2626',
                            fontWeight: 600
                        }}
                    />
                )}
            />
            <DateField source="createdAt" label="Sana" />
            <FunctionField
                label="App"
                render={(record: any) => (
                    <Chip label={record?.showInApp !== false ? '✓' : '✗'} size="small"
                        sx={{ bgcolor: record?.showInApp !== false ? 'rgba(17,69,57,0.08)' : 'rgba(200,50,50,0.08)', color: record?.showInApp !== false ? '#114539' : '#dc2626', fontWeight: 600, minWidth: 32 }} />
                )}
            />
            <FunctionField
                label="TMA"
                render={(record: any) => (
                    <Chip label={record?.showInTma !== false ? '✓' : '✗'} size="small"
                        sx={{ bgcolor: record?.showInTma !== false ? 'rgba(17,69,57,0.08)' : 'rgba(200,50,50,0.08)', color: record?.showInTma !== false ? '#114539' : '#dc2626', fontWeight: 600, minWidth: 32 }} />
                )}
            />
            <ShowButton label="Ko'rish" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);

// ── Consultation Show ──
export const ConsultationShow = () => (
    <Show title={<span>Konsultatsiya tafsilotlari</span>}>
        <SimpleShowLayout sx={{ '&.RaSimpleShowLayout-root': { padding: 0, backgroundColor: 'transparent', boxShadow: 'none' } }}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '5fr 7fr' }} gap={4} width="100%">
                <Box>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', height: '100%' }}>
                        <Typography variant="h4" sx={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 800, color: '#114539' }} gutterBottom>
                            <TextField source="title" />
                        </Typography>

                        <Box display="flex" gap={1} mb={3}>
                            <FunctionField render={(record: any) => (
                                <Chip
                                    label={record?.isActive ? 'Ko\'rinadigan' : 'Yashirin'}
                                    color={record?.isActive ? 'success' : 'default'}
                                    size="small"
                                />
                            )} />
                            <FunctionField render={(record: any) => {
                                const fmt = record?.consultationFormat;
                                const labels: Record<string, string> = { ONLINE: 'Onlayn', OFFLINE: 'Oflayn', HYBRID: 'Aralash' };
                                return fmt ? <Chip label={labels[fmt] || fmt} size="small" variant="outlined" /> : null;
                            }} />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box display="flex" flexDirection="column" gap={2}>
                            <NumberField source="price" label="Narx" options={{ style: 'currency', currency: 'UZS' }} />
                            <TextField source="description" label="Tavsif" emptyText="—" sx={{ whiteSpace: 'pre-wrap' }} />
                            <TextField source="location" label="Joylashuv" emptyText="—" />
                            <TextField source="schedule" label="Jadval" emptyText="—" />
                            <TextField source="times" label="Vaqt" emptyText="—" />
                        </Box>
                    </Paper>
                </Box>

                <Box>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
                        <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>So'nggi buyurtmalar</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Alert severity="info" sx={{ borderRadius: 2, bgcolor: 'rgba(17,69,57,0.04)', '& .MuiAlert-icon': { color: '#114539' } }}>
                            Buyurtmalar "Foydalanuvchilar" sahifasida ko'rsatiladi. Bu yerda faqat konsultatsiya ma'lumotlari.
                        </Alert>
                    </Paper>
                </Box>
            </Box>
        </SimpleShowLayout>
    </Show>
);

// ── Consultation Edit ──
export const ConsultationEdit = () => (
    <Edit title={<span>Konsultatsiyani tahrirlash</span>} redirect="show">
        <SimpleForm sx={{
            maxWidth: 800,
            '& .MuiPaper-root': {
                backgroundColor: 'background.paper',
                borderRadius: '14px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
            }
        }}>
            <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>Asosiy ma'lumotlar</Typography>
            <Divider sx={{ mb: 3 }} />

            <TranslatableTextInput sourceUz="title" sourceRu="titleRu" labelUz="Nomi (UZ)" labelRu="Nomi (RU)" />
            <TranslatableTextInput sourceUz="description" sourceRu="descriptionRu" labelUz="Tavsif (UZ)" labelRu="Tavsif (RU)" multiline rows={4} />

            <Box display="flex" gap={2} width="100%">
                <NumberInput source="price" label="Narx (UZS)" fullWidth />
                <NumberInput source="durationDays" label="Muddat (kun)" fullWidth helperText="Konsultatsiya muddati" />
            </Box>

            <SelectInput source="consultationFormat" label="Format" choices={[
                { id: 'ONLINE', name: 'Onlayn' },
                { id: 'OFFLINE', name: 'Oflayn' },
                { id: 'HYBRID', name: 'Aralash' },
            ]} fullWidth />

            <Box mt={3}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>Joylashuv va vaqt</Typography>
                <Divider sx={{ mb: 3 }} />
                <TranslatableTextInput sourceUz="location" sourceRu="locationRu" labelUz="Joylashuv (UZ)" labelRu="Joylashuv (RU)" />
                <TranslatableTextInput sourceUz="schedule" sourceRu="scheduleRu" labelUz="Jadval (UZ)" labelRu="Jadval (RU)" />
                <TranslatableTextInput sourceUz="times" sourceRu="timesRu" labelUz="Vaqt (UZ)" labelRu="Vaqt (RU)" />
            </Box>

            <Box mt={3}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>Ko'rinish va rasm</Typography>
                <Divider sx={{ mb: 3 }} />
                <BooleanInput source="isActive" label="Foydalanuvchilarga ko'rsatish" />
                <BooleanInput source="showInApp" label="Ilovada ko'rsatish (App)" defaultValue={true} />
                <BooleanInput source="showInTma" label="TMA da ko'rsatish (Telegram Mini App)" defaultValue={true} />
                <GcsImageInput source="coverImage" label="Muqova rasmi" bucket="assets" pathPrefix="consultations/covers" />
                <GcsImageInput source="bannerImage" label="Banner rasmi (sahifa uchun)" bucket="assets" pathPrefix="consultations/banners" />
            </Box>
        </SimpleForm>
    </Edit>
);

// ── Consultation Create ──
export const ConsultationCreate = () => (
    <Create title={<span>Yangi konsultatsiya yaratish</span>} redirect="show"
        transform={(data: any) => ({
            ...data,
            productType: 'CONSULTATION',
            type: 'ONLINE',
            targetAudience: 'ALL',
            status: 'ACTIVE',
        })}
    >
        <SimpleForm sx={{
            maxWidth: 800,
            '& .MuiPaper-root': {
                backgroundColor: 'background.paper',
                borderRadius: '14px',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
            }
        }}>
            <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>Asosiy ma'lumotlar</Typography>
            <Divider sx={{ mb: 3 }} />

            <TranslatableTextInput sourceUz="title" sourceRu="titleRu" labelUz="Nomi (UZ)" labelRu="Nomi (RU)" />
            <TranslatableTextInput sourceUz="description" sourceRu="descriptionRu" labelUz="Tavsif (UZ)" labelRu="Tavsif (RU)" multiline rows={4} />

            <Box display="flex" gap={2} width="100%">
                <NumberInput source="price" label="Narx (UZS)" fullWidth />
                <NumberInput source="durationDays" label="Muddat (kun)" fullWidth helperText="Konsultatsiya muddati" />
            </Box>

            <SelectInput source="consultationFormat" label="Format" choices={[
                { id: 'ONLINE', name: 'Onlayn' },
                { id: 'OFFLINE', name: 'Oflayn' },
                { id: 'HYBRID', name: 'Aralash' },
            ]} fullWidth />

            <Box mt={3}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>Joylashuv va vaqt</Typography>
                <Divider sx={{ mb: 3 }} />
                <TranslatableTextInput sourceUz="location" sourceRu="locationRu" labelUz="Joylashuv (UZ)" labelRu="Joylashuv (RU)" />
                <TranslatableTextInput sourceUz="schedule" sourceRu="scheduleRu" labelUz="Jadval (UZ)" labelRu="Jadval (RU)" />
                <TranslatableTextInput sourceUz="times" sourceRu="timesRu" labelUz="Vaqt (UZ)" labelRu="Vaqt (RU)" />
            </Box>

            <Box mt={3}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>Ko'rinish va rasm</Typography>
                <Divider sx={{ mb: 3 }} />
                <BooleanInput source="isActive" label="Foydalanuvchilarga ko'rsatish" defaultValue={true} />
                <BooleanInput source="showInApp" label="Ilovada ko'rsatish (App)" defaultValue={true} />
                <BooleanInput source="showInTma" label="TMA da ko'rsatish (Telegram Mini App)" defaultValue={true} />
                <GcsImageInput source="coverImage" label="Muqova rasmi" bucket="assets" pathPrefix="consultations/covers" />
                <GcsImageInput source="bannerImage" label="Banner rasmi (sahifa uchun)" bucket="assets" pathPrefix="consultations/banners" />
            </Box>
        </SimpleForm>
    </Create>
);

// ── Resource Export ──
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export default {
    list: ConsultationList,
    show: ConsultationShow,
    edit: ConsultationEdit,
    create: ConsultationCreate,
    icon: MedicalServicesIcon,
    options: { label: 'Konsultatsiyalar' },
};
