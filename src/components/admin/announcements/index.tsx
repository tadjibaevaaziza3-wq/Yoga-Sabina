"use client";

import {
    List, Datagrid, TextField, DateField, EditButton, Edit, Create,
    SimpleForm, SelectInput, BooleanInput, BooleanField, Show, SimpleShowLayout,
    ShowButton, FunctionField, TextInput, DateTimeInput
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import { TranslatableTextInput } from '../inputs/TranslatableTextInput';
import { GcsImageInput } from '../inputs/GcsImageInput';

const typeChoices = [
    { id: 'INFO', name: "📋 Ma'lumot" },
    { id: 'MEETING', name: '🤝 Uchrashuv' },
    { id: 'PROMO', name: '🏷️ Aksiya' },
    { id: 'URGENT', name: '🔴 Muhim' },
    { id: 'SUB_EXPIRING', name: '⏰ Obuna tugamoqda' },
    { id: 'FREE_LESSON', name: '🎥 Bepul dars' },
    { id: 'SALE', name: '💰 Chegirma' },
];

const audienceChoices = [
    { id: 'ALL', name: '👥 Barchaga' },
    { id: 'SUBSCRIBERS', name: '✅ Faqat obunachilarga' },
    { id: 'NON_SUBSCRIBERS', name: '🔒 Obuna bo\'lmaganlarga' },
];

const typeColors: Record<string, string> = {
    INFO: '#2563eb',
    MEETING: '#0a8069',
    PROMO: '#d97706',
    URGENT: '#dc2626',
    SUB_EXPIRING: '#f59e0b',
    FREE_LESSON: '#7c3aed',
    SALE: '#ec4899',
};

export const AnnouncementList = () => (
    <List sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid rowClick="show">
            <TextField source="title" label="Sarlavha" />
            <FunctionField label="Turi" render={(record: any) => (
                <Chip
                    label={typeChoices.find(c => c.id === record?.type)?.name || record?.type}
                    size="small"
                    sx={{ bgcolor: typeColors[record?.type] || '#5a6b5a', color: '#fff', fontWeight: 600 }}
                />
            )} />
            <FunctionField label="Auditoriya" render={(record: any) => (
                <Chip
                    label={audienceChoices.find(c => c.id === record?.audience)?.name || record?.audience || 'Barchaga'}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: '#114539', color: '#114539' }}
                />
            )} />
            <BooleanField source="isActive" label="Faol" />
            <BooleanField source="isPinned" label="📌" />
            <DateField source="createdAt" label="Sana" showTime />
            <ShowButton label="Ko'rish" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);

export const AnnouncementShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="title" label="Sarlavha" />
            <TextField source="titleRu" label="Sarlavha (RU)" />
            <TextField source="message" label="Xabar" />
            <TextField source="messageRu" label="Xabar (RU)" />
            <FunctionField label="Turi" render={(record: any) => (
                <Chip label={typeChoices.find(c => c.id === record?.type)?.name || record?.type}
                    sx={{ bgcolor: typeColors[record?.type] || '#5a6b5a', color: '#fff', fontWeight: 600 }} />
            )} />
            <FunctionField label="Auditoriya" render={(record: any) =>
                audienceChoices.find(c => c.id === record?.audience)?.name || 'Barchaga'
            } />
            <TextField source="targetUrl" label="Havola" />
            <BooleanField source="isActive" label="Faol" />
            <BooleanField source="isPinned" label="Qadoqlangan" />
            <DateField source="expiresAt" label="Amal qilish muddati" showTime />
            <DateField source="scheduledAt" label="Rejalashtirilgan sana" showTime />
            <DateField source="sentAt" label="Yuborilgan sana" showTime />
            <DateField source="createdAt" label="Yaratilgan sana" showTime />
        </SimpleShowLayout>
    </Show>
);

const AnnouncementForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <TranslatableTextInput sourceUz="title" sourceRu="titleRu" labelUz="Sarlavha (UZ)" labelRu="Sarlavha (RU)" />
        <TranslatableTextInput sourceUz="message" sourceRu="messageRu" labelUz="Xabar (UZ)" labelRu="Xabar (RU)" multiline minRows={4} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <SelectInput source="type" label="Turi" choices={typeChoices} defaultValue="INFO" sx={{ minWidth: 200 }} />
            <SelectInput source="audience" label="Auditoriya" choices={audienceChoices} defaultValue="ALL" sx={{ minWidth: 200 }} />
        </Box>
        <GcsImageInput source="imageUrl" label="Rasm" bucket="assets" pathPrefix="announcements" />
        <TextInput source="targetUrl" label="Havola (URL)" fullWidth helperText="Kurs yoki sahifaga havola (ixtiyoriy)" />
        <DateTimeInput source="expiresAt" label="Amal qilish muddati" helperText="Bo'sh qoldirilsa — doimiy" />
        <Box sx={{ display: 'flex', gap: 3 }}>
            <BooleanInput source="isActive" label="Faol" defaultValue={true} />
            <BooleanInput source="isPinned" label="📌 Qadoqlash (tepada ko'rinadi)" defaultValue={false} />
        </Box>
    </Box>
);

export const AnnouncementEdit = () => (
    <Edit>
        <SimpleForm>
            <AnnouncementForm />
        </SimpleForm>
    </Edit>
);

export const AnnouncementCreate = () => (
    <Create>
        <SimpleForm>
            <AnnouncementForm />
        </SimpleForm>
    </Create>
);

export default {
    list: AnnouncementList,
    show: AnnouncementShow,
    edit: AnnouncementEdit,
    create: AnnouncementCreate,
};
