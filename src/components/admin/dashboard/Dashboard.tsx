"use client";

import { useState, useEffect, useCallback } from 'react';
import { Title } from 'react-admin';
import {
    Box, Typography, Paper, Chip, Avatar, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, Divider, Button, ButtonGroup, TextField, IconButton, Tooltip as MuiTooltip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PlayLessonIcon from '@mui/icons-material/PlayLesson';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import TimerIcon from '@mui/icons-material/Timer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';

// ── Period presets ──
const PERIODS = [
    { key: 'today', label: 'Bugun' },
    { key: '7d', label: '7 kun' },
    { key: '30d', label: '30 kun' },
    { key: '90d', label: '90 kun' },
    { key: '365d', label: '1 yil' },
    { key: 'all', label: 'Barchasi' },
] as const;

// ── Stat Card ──
const StatCard = ({ title, value, subtitle, icon, color = '#114539', dark = false, highlight = false }: any) => (
    <Card sx={{
        bgcolor: dark ? color : '#fff',
        color: dark ? '#fff' : 'inherit',
        borderRadius: 4,
        border: dark ? 'none' : highlight ? `2px solid ${color}30` : '1px solid rgba(17,69,57,0.08)',
        boxShadow: dark ? `0 10px 15px -3px ${color}4D` : highlight ? `0 4px 12px ${color}15` : 'none',
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${color}20` },
    }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="overline" sx={{ opacity: dark ? 0.8 : 0.7, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: dark ? '#fff' : color }}>
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ opacity: dark ? 0.4 : 0.25, color: dark ? '#fff' : color }}>{icon}</Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1.5, opacity: dark ? 0.8 : 0.6, fontSize: '0.75rem' }}>{subtitle}</Typography>
        </CardContent>
    </Card>
);

// ── Chart Card ──
const ChartCard = ({ title, children, height = 280 }: { title: string; children: React.ReactNode; height?: number }) => (
    <Paper sx={{
        p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': { boxShadow: '0 8px 24px rgba(17,69,57,0.08)' },
    }}>
        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>{title}</Typography>
        <Box height={height}>{children}</Box>
    </Paper>
);

// ── Format helpers ──
const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
};

const formatMoney = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
};

// ── CSV Export ──
const exportCSV = (data: any, filename: string) => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row: any) => headers.map(h => row[h] ?? '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

export const Dashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const fetchAnalytics = useCallback(async (selectedPeriod?: string, from?: string, to?: string, retries = 3) => {
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        try {
            let url = '/api/admin/analytics';
            const params = new URLSearchParams();
            if (from && to) {
                params.set('from', from);
                params.set('to', to);
            } else {
                params.set('period', selectedPeriod || period);
            }
            url += `?${params.toString()}`;

            const r = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                credentials: 'include',
            });
            if (!r.ok) {
                if (retries > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return fetchAnalytics(selectedPeriod, from, to, retries - 1);
                }
                throw new Error(`HTTP ${r.status}`);
            }
            const d = await r.json();
            setData(d);
        } catch (err: any) {
            console.error('Dashboard analytics error:', err);
            if (retries > 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                return fetchAnalytics(selectedPeriod, from, to, retries - 1);
            }
            setData({ error: err.message || 'Unknown error' });
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchAnalytics(); }, []);

    const handlePeriodChange = (p: string) => {
        setPeriod(p);
        setShowCustom(false);
        fetchAnalytics(p);
    };

    const handleCustomRange = () => {
        if (customFrom && customTo) {
            setPeriod('custom');
            fetchAnalytics(undefined, customFrom, customTo);
        }
    };

    const handleExportAll = () => {
        if (!data) return;
        // Export KPI summary
        exportCSV([{
            'Jami Foydalanuvchilar': data.totals?.users,
            'Davr Foydalanuvchilari': data.totals?.periodUsers,
            'Faol Obunalar': data.totals?.activeSubscriptions,
            'Davr Obunalari': data.totals?.periodSubscriptions,
            'Jami Daromad': data.totals?.totalRevenue,
            'Davr Daromadi': data.totals?.periodRevenue,
            'Faol 7kun': data.totals?.activeUsers7d,
            "O'rtacha Xarid Vaqti": data.totals?.avgDaysToFirstPurchase,
        }], 'kpi-summary');
    };

    if (loading && !data) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                <CircularProgress sx={{ color: '#114539' }} />
            </Box>
        );
    }

    if (!data || data.error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" sx={{ mb: 2 }}>
                    Analitika yuklanmadi: {data?.error || 'Server javob bermadi'}
                </Typography>
                <button
                    onClick={() => fetchAnalytics()}
                    style={{
                        padding: '8px 24px',
                        background: '#114539',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    Qayta yuklash
                </button>
            </Box>
        );
    }

    const { totals, timeSeries, courseKPIs, mostWatched, mostFavorited, dateRange } = data;
    const periodLabel = PERIODS.find(p => p.key === dateRange?.period)?.label || `${dateRange?.from} — ${dateRange?.to}`;

    return (
        <Box sx={{ mt: 2, position: 'relative' }}>
            <Title title="Baxtli Men — Boshqaruv" />

            {/* ═══ LUXURY TOOLBAR ═══ */}
            <Paper sx={{
                p: 2.5, mb: 4, borderRadius: 4,
                background: 'linear-gradient(135deg, #0d2e28 0%, #114539 50%, #0a8069 100%)',
                color: '#fff',
                display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
                boxShadow: '0 10px 30px rgba(17,69,57,0.3)',
            }}>
                <Box flex={1} minWidth={200}>
                    <Typography variant="h5" sx={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 800, mb: 0.5 }}>
                        📊 Platforma Analitikasi
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
                        {periodLabel} • {dateRange?.days || 30} kun
                    </Typography>
                </Box>

                {/* Period Presets */}
                <ButtonGroup size="small" sx={{
                    '& .MuiButton-root': {
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.2)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        px: 1.5,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)' },
                    },
                }}>
                    {PERIODS.map(p => (
                        <Button
                            key={p.key}
                            onClick={() => handlePeriodChange(p.key)}
                            sx={{
                                ...(period === p.key && !showCustom ? {
                                    bgcolor: 'rgba(255,255,255,0.25) !important',
                                    borderColor: 'rgba(255,255,255,0.5) !important',
                                } : {}),
                            }}
                        >
                            {p.label}
                        </Button>
                    ))}
                </ButtonGroup>

                {/* Custom Range Toggle */}
                <MuiTooltip title="Maxsus davr">
                    <IconButton onClick={() => setShowCustom(!showCustom)} sx={{ color: '#fff', bgcolor: showCustom ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                        <CalendarTodayIcon fontSize="small" />
                    </IconButton>
                </MuiTooltip>

                {/* Refresh */}
                <MuiTooltip title="Yangilash">
                    <IconButton onClick={() => fetchAnalytics(period)} sx={{ color: '#fff' }}>
                        <RefreshIcon fontSize="small" sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
                    </IconButton>
                </MuiTooltip>

                {/* Download Menu */}
                <MuiTooltip title="CSV Yuklab olish">
                    <IconButton onClick={handleExportAll} sx={{ color: '#fff' }}>
                        <DownloadIcon fontSize="small" />
                    </IconButton>
                </MuiTooltip>
            </Paper>

            {/* Custom Date Range Panel */}
            {showCustom && (
                <Paper sx={{
                    p: 2.5, mb: 3, borderRadius: 3,
                    border: '2px solid #114539',
                    display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
                    background: 'linear-gradient(135deg, rgba(17,69,57,0.03), rgba(10,128,105,0.05))',
                }}>
                    <CalendarTodayIcon sx={{ color: '#114539', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#114539' }}>
                        Maxsus davr:
                    </Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' },
                            width: 170,
                        }}
                        InputLabelProps={{ shrink: true }}
                        label="Boshlanish"
                    />
                    <Typography sx={{ color: '#114539', fontWeight: 700 }}>→</Typography>
                    <TextField
                        type="date"
                        size="small"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' },
                            width: 170,
                        }}
                        InputLabelProps={{ shrink: true }}
                        label="Tugash"
                    />
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleCustomRange}
                        disabled={!customFrom || !customTo}
                        sx={{
                            bgcolor: '#114539', borderRadius: 2, fontWeight: 700,
                            '&:hover': { bgcolor: '#0a8069' },
                            textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem',
                        }}
                    >
                        Qo'llash
                    </Button>
                </Paper>
            )}

            {/* Loading overlay */}
            {loading && (
                <Box sx={{
                    position: 'absolute', top: 120, left: 0, right: 0, display: 'flex',
                    justifyContent: 'center', zIndex: 10, pointerEvents: 'none',
                }}>
                    <Chip icon={<CircularProgress size={14} sx={{ color: '#114539' }} />}
                        label="Yuklanmoqda..." sx={{ bgcolor: '#fff', boxShadow: 2, fontWeight: 600 }} />
                </Box>
            )}

            {/* ── Row 1: KPI Cards ── */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2.5} mb={4}>
                <StatCard
                    title="Jami foydalanuvchilar"
                    value={totals.users?.toLocaleString() || 0}
                    subtitle={`Davrda: +${totals.periodUsers || 0}`}
                    icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                    color="#114539" dark
                />
                <StatCard
                    title="Faol obunalar"
                    value={totals.activeSubscriptions || 0}
                    subtitle={`Davrda: +${totals.periodSubscriptions || 0} | Faol 7k: ${totals.activeUsers7d || 0}`}
                    icon={<SubscriptionsIcon sx={{ fontSize: 40 }} />}
                    color="#0a8069" highlight
                />
                <StatCard
                    title="Davr daromadi"
                    value={`${formatMoney(totals.periodRevenue || 0)} so'm`}
                    subtitle={`Jami: ${formatMoney(totals.totalRevenue)} so'm`}
                    icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
                    color="#16a34a" highlight
                />
                <StatCard
                    title="O'rtacha xarid vaqti"
                    value={`${totals.avgDaysToFirstPurchase} kun`}
                    subtitle="Ro'yxatdan birinchi xaridgacha"
                    icon={<TimerIcon sx={{ fontSize: 40 }} />}
                    color="#d97706"
                />
            </Box>

            {/* ── Row 2: Secondary Stats ── */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2} mb={4}>
                <StatCard title="Kurslar" value={totals.courses} subtitle="Faol kurslar" icon={<SchoolIcon sx={{ fontSize: 36 }} />} color="#114539" />
                <StatCard title="Darslar" value={totals.lessons} subtitle="Jami darslar" icon={<PlayLessonIcon sx={{ fontSize: 36 }} />} color="#5a6b5a" />
                <StatCard title="Jami daromad" value={`${formatMoney(totals.totalRevenue)}`} subtitle="Barcha to'lovlar" icon={<MonetizationOnIcon sx={{ fontSize: 36 }} />} color="#16a34a" />
                <StatCard title="Faol foydalanuvchilar" value={totals.activeUsers7d} subtitle="So'nggi 7 kun" icon={<VisibilityIcon sx={{ fontSize: 36 }} />} color="#0a8069" />
            </Box>

            {/* ── Row 3: Line Charts with Export ── */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3} mb={4}>
                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>📈 Ro'yxatdan o'tish</Typography>
                        <MuiTooltip title="CSV yuklab olish">
                            <IconButton size="small" onClick={() => exportCSV(timeSeries.registrations, 'registrations')}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </MuiTooltip>
                    </Box>
                    <Box height={280}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries.registrations}>
                                <defs>
                                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#114539" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#114539" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('uz-UZ')} />
                                <Area type="monotone" dataKey="count" stroke="#114539" fill="url(#regGrad)" strokeWidth={2.5} name="Yangi foydalanuvchilar" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>💰 Daromad</Typography>
                        <MuiTooltip title="CSV yuklab olish">
                            <IconButton size="small" onClick={() => exportCSV(timeSeries.revenue, 'revenue')}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </MuiTooltip>
                    </Box>
                    <Box height={280}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries.revenue}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                <YAxis tickFormatter={formatMoney} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} so'm`, 'Daromad']} labelFormatter={(d) => new Date(d).toLocaleDateString('uz-UZ')} />
                                <Area type="monotone" dataKey="amount" stroke="#16a34a" fill="url(#revGrad)" strokeWidth={2.5} name="Daromad" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>📋 Obunalar</Typography>
                        <MuiTooltip title="CSV yuklab olish">
                            <IconButton size="small" onClick={() => exportCSV(timeSeries.subscriptions, 'subscriptions')}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </MuiTooltip>
                    </Box>
                    <Box height={280}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeries.subscriptions}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('uz-UZ')} />
                                <Line type="monotone" dataKey="count" stroke="#0a8069" strokeWidth={2.5} dot={{ r: 3 }} name="Obunalar" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>👥 O'sish</Typography>
                        <MuiTooltip title="CSV yuklab olish">
                            <IconButton size="small" onClick={() => exportCSV(timeSeries.cumulativeUsers, 'growth')}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </MuiTooltip>
                    </Box>
                    <Box height={280}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries.cumulativeUsers}>
                                <defs>
                                    <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('uz-UZ')} />
                                <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#cumGrad)" strokeWidth={2.5} name="Jami foydalanuvchilar" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Box>

            {/* ── Row 4: Course KPIs ── */}
            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)', mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>
                        🎯 Kurs KPI — Obunalar va faollik
                    </Typography>
                    <MuiTooltip title="CSV yuklab olish">
                        <IconButton size="small" onClick={() => exportCSV(
                            courseKPIs?.map((c: any) => ({
                                'Kurs': c.title,
                                'Faol obunalar': c.activeSubscribers,
                                'Jami xaridlar': c.totalPurchases,
                                'Darslar': c.totalLessons,
                                "Ko'rishlar": c.totalWatches,
                                'Yoqtirishlar': c.totalLikes,
                            })),
                            'course-kpis'
                        )}>
                            <DownloadIcon fontSize="small" />
                        </IconButton>
                    </MuiTooltip>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 700, color: '#114539', borderBottom: '2px solid rgba(17,69,57,0.15)' } }}>
                                <TableCell>Kurs</TableCell>
                                <TableCell align="center">Faol obunalar</TableCell>
                                <TableCell align="center">Jami xaridlar</TableCell>
                                <TableCell align="center">Darslar</TableCell>
                                <TableCell align="center">Video ko'rishlar</TableCell>
                                <TableCell align="center">Yoqtirganlar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courseKPIs?.map((c: any) => (
                                <TableRow key={c.id} sx={{ '&:hover': { bgcolor: 'rgba(17,69,57,0.02)' } }}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar src={c.coverImage} variant="rounded" sx={{ width: 32, height: 32, bgcolor: '#114539' }}>
                                                {c.title?.[0]}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.title}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={c.activeSubscribers} size="small" sx={{ bgcolor: 'rgba(10,128,105,0.1)', color: '#0a8069', fontWeight: 700 }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={c.totalPurchases} size="small" sx={{ bgcolor: 'rgba(22,163,74,0.08)', color: '#16a34a', fontWeight: 700 }} />
                                    </TableCell>
                                    <TableCell align="center">{c.totalLessons}</TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                            <VisibilityIcon sx={{ fontSize: 14, color: '#6b7280' }} /> {c.totalWatches}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                            <FavoriteIcon sx={{ fontSize: 14, color: '#ef4444' }} /> {c.totalLikes}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!courseKPIs || courseKPIs.length === 0) && (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: '#6b7280' }}>Kurslar topilmadi</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ── Row 5: Most Watched + Most Favorited ── */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3} mb={4}>
                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VisibilityIcon /> Eng ko'p ko'rilgan videolar
                        </Typography>
                        <MuiTooltip title="CSV yuklab olish">
                            <IconButton size="small" onClick={() => exportCSV(mostWatched, 'most-watched')}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </MuiTooltip>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {mostWatched?.length > 0 ? mostWatched.map((v: any, i: number) => (
                        <Box key={v.lessonId} display="flex" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: '1px solid #f3f4f6' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Chip label={`#${i + 1}`} size="small" sx={{
                                    bgcolor: i < 3 ? '#114539' : 'rgba(17,69,57,0.06)',
                                    color: i < 3 ? '#fff' : '#114539',
                                    fontWeight: 800, width: 36, height: 24
                                }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{v.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{v.courseTitle}</Typography>
                                </Box>
                            </Box>
                            <Chip icon={<VisibilityIcon sx={{ fontSize: 14 }} />} label={v.watchCount} size="small" variant="outlined" />
                        </Box>
                    )) : (
                        <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: 'center' }}>Ma'lumot topilmadi</Typography>
                    )}
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FavoriteIcon sx={{ color: '#ef4444' }} /> Eng sevimli darslar
                        </Typography>
                        <MuiTooltip title="CSV yuklab olish">
                            <IconButton size="small" onClick={() => exportCSV(mostFavorited, 'most-favorited')}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </MuiTooltip>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {mostFavorited?.length > 0 ? mostFavorited.map((v: any, i: number) => (
                        <Box key={v.lessonId} display="flex" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: '1px solid #f3f4f6' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Chip label={`#${i + 1}`} size="small" sx={{
                                    bgcolor: i < 3 ? '#ef4444' : 'rgba(239,68,68,0.06)',
                                    color: i < 3 ? '#fff' : '#ef4444',
                                    fontWeight: 800, width: 36, height: 24
                                }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{v.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{v.courseTitle}</Typography>
                                </Box>
                            </Box>
                            <Chip icon={<FavoriteIcon sx={{ fontSize: 14, color: '#ef4444' }} />} label={v.favoriteCount} size="small" variant="outlined" />
                        </Box>
                    )) : (
                        <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: 'center' }}>Hali sevimlilar yo'q</Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};
