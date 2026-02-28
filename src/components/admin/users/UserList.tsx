"use client";

import {
    List, Datagrid, TextField, DateField,
    SearchInput, SelectInput, ShowButton, EditButton,
    FunctionField, useNotify, useRefresh, useListContext,
    Button as RaButton, TopToolbar, ExportButton
} from 'react-admin';
import { Chip, Box, Tooltip, Typography, IconButton, Button } from '@mui/material';
import { CheckCircle, HourglassTop, Warning, FileDownload } from '@mui/icons-material';
import { useState, useEffect } from 'react';

// Fetch courses for the course filter dropdown
const useCourseChoices = () => {
    const [choices, setChoices] = useState<{ id: string; name: string }[]>([]);
    useEffect(() => {
        fetch('/api/admin/courses')
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setChoices(data.map((c: any) => ({ id: c.id, name: typeof c.title === 'object' ? (c.title?.uz || c.title?.ru || c.id) : c.title })));
                }
            })
            .catch(() => { });
    }, []);
    return choices;
};

// Filter component with course choices
const UserFilters = () => {
    const courseChoices = useCourseChoices();
    return [
        <SearchInput source="q" alwaysOn key="search" placeholder="Ism, telefon, TG nomi..." />,
        <SelectInput source="role" label="Rol" choices={[
            { id: 'USER', name: 'Foydalanuvchi' },
            { id: 'ADMIN', name: 'Admin' },
            { id: 'SUPER_ADMIN', name: 'Super Admin' },
        ]} key="role" />,
        <SelectInput source="paymentStatus" label="To'lov holati" choices={[
            { id: 'paid', name: "✅ To'langan" },
            { id: 'unpaid', name: "❌ To'lanmagan" },
            { id: 'pending', name: "⏳ Kutilmoqda" },
        ]} key="paymentStatus" />,
        <SelectInput source="courseId" label="Kurs bo'yicha" choices={courseChoices} key="courseId" />,
        <SelectInput source="expiryAlarm" label="Muddat" choices={[
            { id: 'expiring_3d', name: '⚠️ 3 kun ichida tugaydi' },
            { id: 'expired', name: '🔴 Muddati o\'tgan' },
            { id: 'active', name: '🟢 Faol' },
        ]} key="expiryAlarm" />,
        <SelectInput source="subscriptionCount" label="Obuna soni" choices={[
            { id: '0', name: '0 ta obuna' },
            { id: '1', name: '1 ta obuna' },
            { id: '2', name: '2+ ta obuna' },
            { id: '3', name: '3+ ta obuna' },
        ]} key="subscriptionCount" />,
        <SelectInput source="segment" label="Segment" choices={[
            { id: 'cold', name: 'Cold' },
            { id: 'warm', name: 'Warm' },
            { id: 'hot', name: 'Hot' },
            { id: 'vip', name: 'VIP' },
        ]} key="segment" />,
    ];
};

// Excel Export Action Button
const ExcelExportButton = () => {
    const { filterValues } = useListContext();
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (filterValues) {
                Object.entries(filterValues).forEach(([key, value]) => {
                    if (value) params.set(key, String(value));
                });
            }
            const res = await fetch(`/api/admin/users/export?${params.toString()}`);
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
            alert("Export xatoligi yuz berdi");
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={exporting}
            startIcon={<FileDownload />}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, borderColor: '#114539', color: '#114539', '&:hover': { borderColor: '#0a8069', bgcolor: '#114539/5' } }}
        >
            {exporting ? 'Yuklanmoqda...' : 'Excel Export'}
        </Button>
    );
};

const ListActions = () => (
    <TopToolbar>
        <ExcelExportButton />
    </TopToolbar>
);

// Row style based on subscription status
const rowStyle = (record: any) => {
    if (!record) return {};

    if (record.hasPendingPayment) {
        return {
            backgroundColor: '#dcfce7',
            borderLeft: '4px solid #16a34a',
        };
    }

    if (record.isExpiringSoon) {
        return {
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #dc2626',
        };
    }

    return {};
};

// Approve payment button component
const ApprovePaymentButton = ({ record }: any) => {
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record?.hasPendingPayment) return null;

    const handleApprove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`"${record.pendingPaymentCourse}" kursiga to'lovni tasdiqlaysizmi?\nFoydalanuvchiga avtomatik obuna beriladi.`)) return;

        try {
            const res = await fetch(`/api/admin/users/${record.id}/approve-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                notify("✅ To'lov tasdiqlandi, obuna avtomatik berildi!", { type: 'success' });
                refresh();
            } else {
                notify(data.error || "Xatolik yuz berdi", { type: 'error' });
            }
        } catch {
            notify("Server xatoligi", { type: 'error' });
        }
    };

    return (
        <Tooltip title={`To'lovni tasdiqlash: ${record.pendingPaymentCourse}`}>
            <IconButton
                onClick={handleApprove}
                size="small"
                sx={{
                    bgcolor: '#16a34a',
                    color: '#fff',
                    '&:hover': { bgcolor: '#15803d' },
                    width: 28, height: 28,
                }}
            >
                <CheckCircle sx={{ fontSize: 16 }} />
            </IconButton>
        </Tooltip>
    );
};

export const UserList = () => {
    const filters = UserFilters();
    return (
        <List
            filters={filters}
            sort={{ field: 'createdAt', order: 'DESC' }}
            actions={<ListActions />}
            sx={{
                '& .RaList-main': {
                    backgroundColor: 'background.paper',
                    borderRadius: '14px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
                }
            }}
        >
            <Datagrid rowClick="show" bulkActionButtons={false} rowSx={rowStyle}>
                <FunctionField
                    label="ID"
                    render={(record: any) => record?.userNumber ? (
                        <Chip size="small" label={`#${record.userNumber}`} sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.7rem', bgcolor: '#11453910', color: '#114539' }} />
                    ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                />
                <TextField source="firstName" label="Ism" emptyText="—" />
                <TextField source="lastName" label="Familiya" emptyText="—" />
                <FunctionField
                    label="TG nomi"
                    render={(record: any) => {
                        if (!record?.telegramUsername) return <Typography variant="caption" color="text.secondary">—</Typography>;
                        return (
                            <Chip
                                size="small"
                                label={`@${record.telegramUsername}`}
                                sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600, fontSize: '0.7rem' }}
                            />
                        );
                    }}
                />
                <FunctionField
                    label="TG ID"
                    render={(record: any) => {
                        if (!record?.telegramId) return <Typography variant="caption" color="text.secondary">—</Typography>;
                        return (
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#334155' }}>
                                {record.telegramId}
                            </Typography>
                        );
                    }}
                />
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
                {/* Subscription dates */}
                <FunctionField
                    label="Obuna boshi"
                    sortable={false}
                    render={(record: any) => {
                        if (!record?.subStartDate) return <Typography variant="caption" color="text.secondary">—</Typography>;
                        return (
                            <Typography variant="caption" sx={{ fontWeight: 500, color: '#114539' }}>
                                {new Date(record.subStartDate).toLocaleDateString('uz-UZ')}
                            </Typography>
                        );
                    }}
                />
                <FunctionField
                    label="Obuna tugashi"
                    sortable={false}
                    render={(record: any) => {
                        if (!record?.subEndDate) return <Typography variant="caption" color="text.secondary">—</Typography>;
                        const endDate = new Date(record.subEndDate);
                        const isExpiring = record.isExpiringSoon;
                        const isPast = endDate < new Date();
                        return (
                            <Box display="flex" alignItems="center" gap={0.5}>
                                {isExpiring && <Warning sx={{ fontSize: 14, color: isPast ? '#dc2626' : '#f59e0b' }} />}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        color: isPast ? '#dc2626' : isExpiring ? '#f59e0b' : '#114539',
                                    }}
                                >
                                    {endDate.toLocaleDateString('uz-UZ')}
                                </Typography>
                            </Box>
                        );
                    }}
                />
                {/* Active subscriptions count */}
                <FunctionField
                    label="Faol"
                    sortable={false}
                    render={(record: any) => {
                        const active = record?.activeSubscriptionCount || 0;
                        if (active > 0) {
                            return <Chip size="small" label={`🟢 ${active}`} sx={{ bgcolor: '#16a34a12', color: '#16a34a', fontWeight: 700, fontSize: '0.7rem' }} />;
                        }
                        return <Chip size="small" label="—" sx={{ bgcolor: '#f3f4f6', color: '#9ca3af', fontSize: '0.7rem' }} />;
                    }}
                />
                {/* Payment approval column */}
                <FunctionField
                    label="To'lov"
                    sortable={false}
                    render={(record: any) => {
                        if (record?.hasPendingPayment) {
                            return (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <ApprovePaymentButton record={record} />
                                    <Tooltip title={`Skrinshot yuborilgan: ${record.pendingPaymentCourse}`}>
                                        <Chip
                                            size="small"
                                            icon={<HourglassTop sx={{ fontSize: 12 }} />}
                                            label="Kutilmoqda"
                                            sx={{ bgcolor: '#fef9c3', color: '#a16207', fontWeight: 700, fontSize: '0.65rem' }}
                                        />
                                    </Tooltip>
                                </Box>
                            );
                        }
                        return null;
                    }}
                />
                {/* Courses summary */}
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
                                        maxWidth: 150,
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
                <ShowButton label="" />
                <EditButton label="" />
            </Datagrid>
        </List>
    );
};
