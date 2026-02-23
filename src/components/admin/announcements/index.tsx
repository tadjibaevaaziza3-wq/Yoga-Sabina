"use client";

import {
    List, Datagrid, TextField, DateField, EditButton, Edit, Create,
    SimpleForm, SelectInput, BooleanInput, BooleanField, Show, SimpleShowLayout,
    ShowButton, FunctionField
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import { TranslatableTextInput } from '../inputs/TranslatableTextInput';
import { GcsImageInput } from '../inputs/GcsImageInput';

const typeChoices = [
    { id: 'INFO', name: "Ma'lumot" },
    { id: 'MEETING', name: "Uchrashuv" },
    { id: 'PROMO', name: 'Aksiya' },
    { id: 'URGENT', name: 'Muhim' },
];

const typeColors: Record<string, string> = {
    INFO: '#2563eb',
    MEETING: '#0a8069',
    PROMO: '#d97706',
    URGENT: '#dc2626',
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
            <BooleanField source="isActive" label="Faol" />
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
            <TextField source="type" label="Turi" />
            <BooleanField source="isActive" label="Faol" />
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
        <SelectInput source="type" label="Turi" choices={typeChoices} defaultValue="INFO" fullWidth />
        <GcsImageInput source="imageUrl" label="Rasm" bucket="assets" pathPrefix="announcements" />
        <BooleanInput source="isActive" label="Faol" defaultValue={true} />
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
