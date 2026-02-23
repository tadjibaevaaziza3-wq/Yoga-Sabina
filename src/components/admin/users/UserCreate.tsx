"use client";

import {
    Create, SimpleForm, TextInput, SelectInput, PasswordInput, BooleanInput
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';

export const UserCreate = () => (
    <Create title={<span>Yangi foydalanuvchi</span>} redirect="show">
        <SimpleForm sx={{
            '& .MuiPaper-root': {
                backgroundColor: 'background.paper',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
            }
        }}>
            <Box mb={2}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>
                    Shaxsiy ma&apos;lumotlar
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box display="flex" gap={2} width="100%">
                    <TextInput source="firstName" label="Ism" fullWidth />
                    <TextInput source="lastName" label="Familiya" fullWidth />
                </Box>
                <Box display="flex" gap={2} width="100%">
                    <TextInput source="email" label="Email" fullWidth type="email" />
                    <TextInput source="phone" label="Telefon" fullWidth />
                </Box>
                <TextInput source="telegramUsername" label="Telegram username" fullWidth />
            </Box>

            <Box mb={2} mt={2}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>
                    Tizim sozlamalari
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box display="flex" gap={2} width="100%">
                    <SelectInput source="role" label="Rol" choices={[
                        { id: 'USER', name: 'Foydalanuvchi' },
                        { id: 'ADMIN', name: 'Admin' },
                        { id: 'SUPER_ADMIN', name: 'Super Admin' },
                    ]} fullWidth defaultValue="USER" />
                </Box>
                <PasswordInput source="password" label="Parol (ixtiyoriy)" fullWidth helperText="Bo'sh qoldirilsa parolsiz yaratiladi" />
            </Box>
        </SimpleForm>
    </Create>
);
