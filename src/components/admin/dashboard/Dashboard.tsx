"use client";

import { useState, useEffect } from 'react';
import { Title } from 'react-admin';
import {
    Box, Typography, Paper, Chip, Avatar, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, Divider
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
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';

// ── Stat Card ──
const StatCard = ({ title, value, subtitle, icon, color = '#114539', dark = false }: any) => (
    <Card sx={{
        bgcolor: dark ? color : '#fff',
        color: dark ? '#fff' : 'inherit',
        borderRadius: 4,
        border: dark ? 'none' : '1px solid rgba(17,69,57,0.08)',
        boxShadow: dark ? `0 10px 15px -3px ${color}4D` : 'none',
    }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="overline" sx={{ opacity: dark ? 0.8 : 0.7, fontWeight: 700, letterSpacing: '0.1em' }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: dark ? '#fff' : color }}>
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ opacity: dark ? 0.4 : 0.25, color: dark ? '#fff' : color }}>{icon}</Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1.5, opacity: dark ? 0.8 : 0.6 }}>{subtitle}</Typography>
        </CardContent>
    </Card>
);

// ── Chart Card ──
const ChartCard = ({ title, children, height = 280 }: { title: string; children: React.ReactNode; height?: number }) => (
    <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)' }}>
        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>{title}</Typography>
        <Box height={height}>{children}</Box>
    </Paper>
);

// ── Format date label ──
const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
};

const formatMoney = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
};

export const Dashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                <CircularProgress sx={{ color: '#114539' }} />
            </Box>
        );
    }

    if (!data || data.error) {
        return <Typography color="error">Analitika yuklanmadi</Typography>;
    }

    const { totals, timeSeries, courseKPIs, mostWatched, mostFavorited } = data;

    return (
        <Box sx={{ mt: 2 }}>
            <Title title="Baxtli Men — Boshqaruv" />
            <Typography variant="h4" sx={{ mb: 3, fontFamily: 'var(--font-spectral), serif', fontWeight: 800, color: '#114539' }}>
                📊 Platforma analitikasi
            </Typography>

            {/* ── Row 1: KPI Cards ── */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2.5} mb={4}>
                <StatCard
                    title="Jami foydalanuvchilar"
                    value={totals.users?.toLocaleString() || 0}
                    subtitle="Barcha ro'yxatdan o'tganlar"
                    icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                    color="#114539" dark
                />
                <StatCard
                    title="Faol obunalar"
                    value={totals.activeSubscriptions || 0}
                    subtitle={`${totals.activeUsers7d || 0} faol (7 kun)`}
                    icon={<SubscriptionsIcon sx={{ fontSize: 40 }} />}
                    color="#0a8069"
                />
                <StatCard
                    title="Oylik daromad"
                    value={`${formatMoney(totals.monthlyRevenue)} so'm`}
                    subtitle={`Jami: ${formatMoney(totals.totalRevenue)} so'm`}
                    icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
                    color="#16a34a"
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

            {/* ── Row 3: Line Charts ── */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3} mb={4}>
                <ChartCard title="📈 Kunlik ro'yxatdan o'tish (30 kun)">
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
                </ChartCard>

                <ChartCard title="💰 Kunlik daromad (30 kun)">
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
                </ChartCard>

                <ChartCard title="📋 Kunlik obunalar (30 kun)">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeSeries.subscriptions}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString('uz-UZ')} />
                            <Line type="monotone" dataKey="count" stroke="#0a8069" strokeWidth={2.5} dot={{ r: 3 }} name="Obunalar" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="👥 Foydalanuvchilar o'sishi (90 kun)">
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
                </ChartCard>
            </Box>

            {/* ── Row 4: Course KPIs ── */}
            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(17,69,57,0.08)', mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>
                    🎯 Kurs KPI — Obunalar va faollik
                </Typography>
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
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VisibilityIcon /> Eng ko'p ko'rilgan videolar
                    </Typography>
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
                    <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteIcon sx={{ color: '#ef4444' }} /> Eng sevimli darslar
                    </Typography>
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
