"use client";

import {
    List, Datagrid, TextField, DateField, FunctionField,
    Show, SimpleShowLayout, EditButton, Edit, SimpleForm,
    BooleanInput, ReferenceField, useNotify, useRefresh
} from 'react-admin';
import { Chip, Box, Typography, Divider, Paper, Button, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FeedbackIcon from '@mui/icons-material/Feedback';

export const FeedbackList = () => (
    <List
        sort={{ field: 'createdAt', order: 'DESC' }}
        sx={{
            '& .RaList-main': {
                backgroundColor: 'background.paper', borderRadius: '14px',
                padding: '24px', boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
            }
        }}
    >
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <ReferenceField source="userId" reference="users" label="Foydalanuvchi">
                <FunctionField render={(r: any) => `${r?.firstName || ''} ${r?.lastName || ''}`.trim() || r?.email || '—'} />
            </ReferenceField>
            <TextField source="message" label="Fikr" />
            <FunctionField
                label="Baho"
                render={(r: any) => (
                    <Box display="flex" alignItems="center" gap={0.3}>
                        {r?.rating ? Array.from({ length: r.rating }).map((_, i) => (
                            <StarIcon key={i} sx={{ fontSize: 16, color: '#f59e0b' }} />
                        )) : '—'}
                    </Box>
                )}
            />
            <FunctionField
                label="Holat"
                render={(r: any) => (
                    <Chip
                        icon={r?.isApproved ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                        label={r?.isApproved ? 'Tasdiqlangan' : 'Kutilmoqda'}
                        size="small"
                        sx={{
                            bgcolor: r?.isApproved ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.08)',
                            color: r?.isApproved ? '#16a34a' : '#d97706',
                            fontWeight: 600,
                        }}
                    />
                )}
            />
            <DateField source="createdAt" label="Sana" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);

export const FeedbackShow = () => (
    <Show>
        <SimpleShowLayout>
            <ReferenceField source="userId" reference="users" label="Foydalanuvchi">
                <FunctionField render={(r: any) => `${r?.firstName || ''} ${r?.lastName || ''}`.trim() || r?.email || '—'} />
            </ReferenceField>
            <TextField source="message" label="Fikr" />
            <FunctionField
                label="Baho"
                render={(r: any) => (
                    <Box display="flex" alignItems="center" gap={0.3}>
                        {r?.rating ? Array.from({ length: r.rating }).map((_, i) => (
                            <StarIcon key={i} sx={{ fontSize: 20, color: '#f59e0b' }} />
                        )) : '—'}
                    </Box>
                )}
            />
            <FunctionField
                label="Holat"
                render={(r: any) => (
                    <Chip
                        label={r?.isApproved ? '✅ Tasdiqlangan' : '⏳ Kutilmoqda'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                    />
                )}
            />
            <DateField source="createdAt" label="Yuborilgan sana" showTime />
        </SimpleShowLayout>
    </Show>
);

export const FeedbackEdit = () => (
    <Edit redirect="list">
        <SimpleForm sx={{
            '& .MuiPaper-root': {
                backgroundColor: 'background.paper', borderRadius: '14px',
                padding: '24px', boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
            }
        }}>
            <ReferenceField source="userId" reference="users" label="Foydalanuvchi">
                <FunctionField render={(r: any) => (
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        {`${r?.firstName || ''} ${r?.lastName || ''}`.trim() || r?.email || '—'}
                    </Typography>
                )} />
            </ReferenceField>
            <TextField source="message" label="Fikr" />
            <BooleanInput source="isApproved" label="Tasdiqlash (About sahifasida ko'rsatiladi)" />
        </SimpleForm>
    </Edit>
);

export default {
    list: FeedbackList,
    show: FeedbackShow,
    edit: FeedbackEdit,
    icon: FeedbackIcon,
    options: { label: "Fikr-mulohazalar" },
};
