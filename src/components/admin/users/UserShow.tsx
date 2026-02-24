"use client";

import { useState, useEffect } from 'react';
import {
    Show, SimpleShowLayout, TextField, EmailField, DateField,
    BooleanField, FunctionField, ReferenceManyField, Datagrid,
    NumberField, useRecordContext, useGetList, useNotify, ReferenceField
} from 'react-admin';
import {
    Box, Typography, Divider, Paper, Chip, CircularProgress, Alert,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField as MuiTextField, MenuItem, Select, FormControl, InputLabel,
    ImageList, ImageListItem, ImageListItemBar, IconButton, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ImageIcon from '@mui/icons-material/Image';

const ShowTitle = () => <span>Foydalanuvchi tafsilotlari</span>;

// ── Stat Card ──
const StatBox = ({ icon, label, value, color = '#114539' }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
    <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', border: `1px solid ${color}15`, bgcolor: `${color}05`, flex: 1, minWidth: 140 }}>
        <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: '#5a6b5a', fontWeight: 600 }}>{label}</Typography>
    </Paper>
);

// ── Add Subscription Dialog ──
const AddSubscriptionDialog = ({ open, onClose, userId }: { open: boolean; onClose: (refresh?: boolean) => void; userId: string }) => {
    const { data: courses } = useGetList('courses', { pagination: { page: 1, perPage: 100 }, sort: { field: 'title', order: 'ASC' } });
    const notify = useNotify();
    const [courseId, setCourseId] = useState('');
    const [startsAt, setStartsAt] = useState(new Date().toISOString().split('T')[0]);
    const [endsAt, setEndsAt] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!courseId || !endsAt) { notify("Kurs va tugash sanasini tanlang", { type: 'warning' }); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}/details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, startsAt, endsAt }),
            });
            if (res.ok) {
                notify('Obuna qo\'shildi!', { type: 'success' });
                onClose(true);
            } else {
                const err = await res.json();
                notify(`Xatolik: ${err.error}`, { type: 'error' });
            }
        } catch { notify('Xatolik yuz berdi', { type: 'error' }); }
        setSaving(false);
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#114539', color: '#fff' }}>
                <span>➕ Obuna qo'shish</span>
                <IconButton onClick={() => onClose()} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '24px !important' }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Kursni tanlang</InputLabel>
                    <Select value={courseId} label="Kursni tanlang" onChange={e => setCourseId(e.target.value)}>
                        {courses?.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                    </Select>
                </FormControl>
                <Box display="flex" gap={2}>
                    <MuiTextField label="Boshlanish sanasi" type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                    <MuiTextField label="Tugash sanasi" type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => onClose()} color="inherit">Bekor qilish</Button>
                <Button onClick={handleSave} disabled={saving} variant="contained" sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a2e26' } }}>
                    {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Saqlash'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Screenshot Gallery ──
const ScreenshotGallery = ({ screenshots }: { screenshots: { id: string; url: string; courseTitle: string; amount: number; status: string; date: string }[] }) => {
    const [selected, setSelected] = useState<string | null>(null);

    if (screenshots.length === 0) {
        return <Alert severity="info" sx={{ borderRadius: 2 }}>Skrinshot topilmadi</Alert>;
    }

    return (
        <>
            <ImageList cols={3} gap={12} sx={{ mb: 0 }}>
                {screenshots.map(s => (
                    <ImageListItem key={s.id} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(17,69,57,0.08)', cursor: 'pointer' }} onClick={() => setSelected(s.url)}>
                        <img src={s.url} alt={s.courseTitle} loading="lazy" style={{ height: 160, objectFit: 'cover' }} />
                        <ImageListItemBar
                            title={s.courseTitle}
                            subtitle={`${s.amount.toLocaleString()} so'm • ${new Date(s.date).toLocaleDateString('uz-UZ')}`}
                            actionIcon={
                                <Chip
                                    label={s.status === 'PAID' ? '✅' : s.status === 'PENDING' ? '⏳' : '❌'}
                                    size="small"
                                    sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.7rem' }}
                                />
                            }
                            sx={{ '& .MuiImageListItemBar-title': { fontSize: '0.75rem' }, '& .MuiImageListItemBar-subtitle': { fontSize: '0.65rem' } }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>

            {/* Lightbox */}
            <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" PaperProps={{ sx: { borderRadius: 3, bgcolor: 'transparent', boxShadow: 'none' } }}>
                <Box position="relative">
                    <IconButton onClick={() => setSelected(null)} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                        <CloseIcon />
                    </IconButton>
                    {selected && <img src={selected} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12 }} />}
                </Box>
            </Dialog>
        </>
    );
};

// ── User Show Content ──
const UserShowContent = () => {
    const record = useRecordContext();
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subDialogOpen, setSubDialogOpen] = useState(false);

    const fetchDetails = async () => {
        if (!record?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${record.id}/details`);
            const data = await res.json();
            setDetails(data);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchDetails(); }, [record?.id]);

    if (!record) return null;

    const now = new Date();

    return (
        <Box>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 2fr' }} gap={3}>
                {/* Left: Personal info */}
                <Box display="flex" flexDirection="column" gap={3}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>Shaxsiy ma&apos;lumotlar</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            <FunctionField
                                label="Rol"
                                render={(r: any) => {
                                    const labels: any = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', USER: 'Foydalanuvchi' };
                                    const colors: any = { SUPER_ADMIN: 'error', ADMIN: 'warning', USER: 'default' };
                                    return <Chip label={labels[r.role] || r.role} color={colors[r.role] || 'default'} size="small" />;
                                }}
                            />
                            <TextField source="firstName" label="Ism" emptyText="—" />
                            <TextField source="lastName" label="Familiya" emptyText="—" />
                            <EmailField source="email" label="Email" emptyText="—" />
                            <TextField source="phone" label="Telefon" emptyText="—" />
                            <TextField source="telegramUsername" label="Telegram" emptyText="—" />
                            <DateField source="createdAt" label="Ro'yxatdan o'tgan sana" showTime />
                            <FunctionField
                                render={(r: any) => {
                                    const seg = r?.segment || 'cold';
                                    const segColors: Record<string, string> = { cold: '#6b7280', warm: '#f59e0b', hot: '#dc2626', vip: '#d97706' };
                                    return <Chip label={`Segment: ${seg.toUpperCase()}`} sx={{ bgcolor: `${segColors[seg]}15`, color: segColors[seg], fontWeight: 700 }} />;
                                }}
                            />
                        </Box>
                    </Paper>

                    {/* Quick stats */}
                    {!loading && details && (
                        <Box display="flex" gap={1.5} flexWrap="wrap">
                            <StatBox icon={<AttachMoneyIcon />} label="Jami to'lov" value={`${details.totalSpent?.toLocaleString() || 0}`} color="#16a34a" />
                            <StatBox icon={<SchoolIcon />} label="Faol kurslar" value={details.activeCourses || 0} color="#114539" />
                        </Box>
                    )}
                </Box>

                {/* Right: Subscriptions, Purchases, Screenshots */}
                <Box display="flex" flexDirection="column" gap={3}>
                    {/* Active Subscriptions */}
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>📜 Obuna tarixi</Typography>
                                {!loading && details && (
                                    <Chip
                                        label={`Jami: ${details.allSubscriptions?.length || 0}`}
                                        size="small"
                                        sx={{ bgcolor: '#11453910', color: '#114539', fontWeight: 700, fontSize: '0.7rem' }}
                                    />
                                )}
                            </Box>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setSubDialogOpen(true)}
                                sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a2e26' }, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                Obuna qo'shish
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {loading ? <CircularProgress size={24} /> : (
                            details?.allSubscriptions?.length > 0 ? (
                                <Box sx={{ overflow: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#114539', fontWeight: 700 }}>Kurs nomi</th>
                                                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#114539', fontWeight: 700 }}>Boshlanish</th>
                                                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#114539', fontWeight: 700 }}>Tugash</th>
                                                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#114539', fontWeight: 700 }}>Holat</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.allSubscriptions.map((s: any) => {
                                                const isActive = s.status === 'ACTIVE' && new Date(s.endsAt) > now;
                                                const isExpired = s.status === 'EXPIRED' || (s.status === 'ACTIVE' && new Date(s.endsAt) <= now);
                                                return (
                                                    <tr
                                                        key={s.id}
                                                        style={{
                                                            borderBottom: '1px solid #f3f4f6',
                                                            backgroundColor: isActive ? '#16a34a06' : 'transparent',
                                                        }}
                                                    >
                                                        <td style={{ padding: '10px 8px', fontWeight: 600, color: '#1a2e1a' }}>
                                                            {s.courseTitle}
                                                        </td>
                                                        <td style={{ padding: '10px 8px', textAlign: 'center', color: '#5a6b5a' }}>
                                                            <CalendarMonthIcon sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'middle', opacity: 0.6 }} />
                                                            {new Date(s.startsAt).toLocaleDateString('uz-UZ')}
                                                        </td>
                                                        <td style={{ padding: '10px 8px', textAlign: 'center', color: '#5a6b5a' }}>
                                                            <CalendarMonthIcon sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'middle', opacity: 0.6 }} />
                                                            {new Date(s.endsAt).toLocaleDateString('uz-UZ')}
                                                        </td>
                                                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                                            <Chip
                                                                label={isActive ? '🟢 Faol' : isExpired ? '🔴 Tugagan' : '⚪ Bekor qilingan'}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    bgcolor: isActive ? '#16a34a12' : isExpired ? '#dc262610' : '#6b728010',
                                                                    color: isActive ? '#16a34a' : isExpired ? '#dc2626' : '#6b7280',
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </Box>
                            ) : <Alert severity="info" sx={{ borderRadius: 2 }}>Obunalar topilmadi</Alert>
                        )}
                    </Paper>

                    {/* Purchases */}
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>
                            <ReceiptLongIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} /> To'lovlar
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {loading ? <CircularProgress size={24} /> : (
                            details?.purchases?.length > 0 ? (
                                <Box sx={{ overflow: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                                <th style={{ textAlign: 'left', padding: '8px', color: '#114539', fontWeight: 700 }}>Kurs</th>
                                                <th style={{ textAlign: 'right', padding: '8px', color: '#114539', fontWeight: 700 }}>Summa</th>
                                                <th style={{ textAlign: 'center', padding: '8px', color: '#114539', fontWeight: 700 }}>Holat</th>
                                                <th style={{ textAlign: 'center', padding: '8px', color: '#114539', fontWeight: 700 }}>Usul</th>
                                                <th style={{ textAlign: 'right', padding: '8px', color: '#114539', fontWeight: 700 }}>Sana</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.purchases.map((p: any) => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{p.courseTitle}</td>
                                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#114539' }}>{Number(p.amount).toLocaleString()} so'm</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <Chip
                                                            label={p.status === 'PAID' ? '✅ To\'langan' : p.status === 'PENDING' ? '⏳ Kutilmoqda' : p.status === 'FAILED' ? '❌ Xato' : '↩ Qaytarilgan'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: p.status === 'PAID' ? 'rgba(22,163,74,0.08)' : p.status === 'PENDING' ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                                                                color: p.status === 'PAID' ? '#16a34a' : p.status === 'PENDING' ? '#d97706' : '#dc2626',
                                                                fontWeight: 600, fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <Chip label={p.provider} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'right', color: '#6b7280', fontSize: '0.8rem' }}>
                                                        {new Date(p.createdAt).toLocaleDateString('uz-UZ')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            ) : <Alert severity="info" sx={{ borderRadius: 2 }}>To'lovlar topilmadi</Alert>
                        )}
                    </Paper>

                    {/* Payment Screenshots */}
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>
                            <ImageIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} /> To'lov skrinshotlari
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {loading ? <CircularProgress size={24} /> : (
                            <ScreenshotGallery screenshots={details?.screenshots || []} />
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Add Subscription Dialog */}
            <AddSubscriptionDialog
                open={subDialogOpen}
                onClose={(refresh) => { setSubDialogOpen(false); if (refresh) fetchDetails(); }}
                userId={record?.id as string}
            />
        </Box>
    );
};

export const UserShow = () => (
    <Show title={<ShowTitle />}>
        <SimpleShowLayout sx={{ '&.RaSimpleShowLayout-root': { padding: 0, backgroundColor: 'transparent', boxShadow: 'none' } }}>
            <UserShowContent />
        </SimpleShowLayout>
    </Show>
);
