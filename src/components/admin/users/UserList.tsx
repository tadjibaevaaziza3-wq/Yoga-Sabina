"use client";

import {
    List, Datagrid, TextField, EmailField, DateField,
    SearchInput, SelectInput, ShowButton, EditButton,
    FunctionField
} from 'react-admin';
import { Chip, Box, Tooltip, Typography } from '@mui/material';

const userFilters = [
    <SearchInput source="q" alwaysOn key="search" />,
    <SelectInput source="role" label="Rol" choices={[
        { id: 'USER', name: 'Foydalanuvchi' },
        { id: 'ADMIN', name: 'Admin' },
        { id: 'SUPER_ADMIN', name: 'Super Admin' },
    ]} key="role" />,
];

export const UserList = () => (
    <List
        filters={userFilters}
        sort={{ field: 'createdAt', order: 'DESC' }}
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
            <TextField source="firstName" label="Ism" emptyText="—" />
            <TextField source="lastName" label="Familiya" emptyText="—" />
            <EmailField source="email" label="Email" emptyText="—" />
            <TextField source="phone" label="Telefon" emptyText="—" />
            <FunctionField
                label="Rol"
                source="role"
                render={(record: any) => {
                    const labels: any = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', USER: 'Foydalanuvchi' };
                    const colors: any = { SUPER_ADMIN: 'error', ADMIN: 'warning', USER: 'default' };
                    return <Chip size="small" label={labels[record.role] || record.role} color={colors[record.role] || 'default'} />;
                }}
            />
            <FunctionField
                label="Segment"
                render={(record: any) => {
                    const seg = record?.segment || 'cold';
                    const segColors: Record<string, string> = { cold: '#6b7280', warm: '#f59e0b', hot: '#dc2626', vip: '#d97706' };
                    return <Chip size="small" label={seg.toUpperCase()} sx={{ bgcolor: `${segColors[seg] || '#6b7280'}15`, color: segColors[seg], fontWeight: 700, fontSize: '0.65rem' }} />;
                }}
            />
            {/* Subscription columns */}
            <FunctionField
                label="Obunalar"
                sortable={false}
                render={(record: any) => {
                    const total = record?.totalSubscriptionCount || 0;
                    return (
                        <Chip
                            size="small"
                            label={total}
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                minWidth: 32,
                                bgcolor: total > 0 ? '#11453910' : '#6b728010',
                                color: total > 0 ? '#114539' : '#6b7280',
                            }}
                        />
                    );
                }}
            />
            <FunctionField
                label="Faol obuna"
                sortable={false}
                render={(record: any) => {
                    const active = record?.activeSubscriptionCount || 0;
                    if (active > 0) {
                        return (
                            <Chip
                                size="small"
                                label={`🟢 ${active} ta`}
                                sx={{ bgcolor: '#16a34a12', color: '#16a34a', fontWeight: 700, fontSize: '0.7rem' }}
                            />
                        );
                    }
                    return <Chip size="small" label="—" sx={{ bgcolor: '#f3f4f6', color: '#9ca3af', fontSize: '0.7rem' }} />;
                }}
            />
            <FunctionField
                label="Kurslar"
                sortable={false}
                render={(record: any) => {
                    const summary = record?.activeSubscriptionsSummary || '—';
                    if (summary === '—') return <Typography variant="caption" color="text.secondary">—</Typography>;
                    return (
                        <Tooltip title={summary} arrow>
                            <Typography
                                variant="caption"
                                sx={{
                                    maxWidth: 180,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                    color: '#1a2e1a',
                                    fontWeight: 500,
                                }}
                            >
                                {summary}
                            </Typography>
                        </Tooltip>
                    );
                }}
            />
            <DateField source="createdAt" label="Ro'yxatdan o'tgan" />
            <ShowButton label="Ko'rish" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);
