"use client";

import {
    List, Datagrid, TextField, EmailField, DateField,
    SearchInput, SelectInput, ShowButton, EditButton,
    FunctionField, useGetList
} from 'react-admin';
import { Chip, Box, Typography } from '@mui/material';

const userFilters = [
    <SearchInput source="q" alwaysOn key="search" />,
    <SelectInput source="role" label="Rol" choices={[
        { id: 'USER', name: 'Foydalanuvchi' },
        { id: 'ADMIN', name: 'Admin' },
        { id: 'SUPER_ADMIN', name: 'Super Admin' },
    ]} key="role" />,
];

// Subscription status indicator for list
const SubscriptionStatusField = () => {
    const record = (window as any).__ra_record;
    // We can't easily get subscription in list view via react-admin without custom dataProvider
    // so we show it from the user's segment field as a proxy
    return null;
};

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
            <DateField source="createdAt" label="Ro'yxatdan o'tgan" />
            <ShowButton label="Ko'rish" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);
