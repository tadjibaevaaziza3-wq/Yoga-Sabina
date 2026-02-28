'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Box, Typography, Paper, Button, IconButton, Chip, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, Divider, Tooltip,
    LinearProgress, Tabs, Tab, Avatar,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ScheduleIcon from '@mui/icons-material/Schedule'
import GroupIcon from '@mui/icons-material/Group'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import WarningIcon from '@mui/icons-material/Warning'

interface Course { id: string; title: string; titleRu?: string; schedule?: string; location?: string }
interface User {
    id: string; firstName: string | null; lastName: string | null; phone: string | null
    telegramUsername?: string | null
    subscriptionStart: string | null; subscriptionEnd: string | null
    isExpired: boolean; purchaseAmount: number | null
}
interface Attendance { id: string; userId: string; status: string; note?: string; user: { id: string; firstName: string | null; lastName: string | null } }
interface Session { id: string; courseId: string; date: string; title?: string; notes?: string; attendances: Attendance[] }

const statusConfig: Record<string, { label: string; color: string; icon: string; bg: string }> = {
    PRESENT: { label: '✅ Keldi', color: '#16a34a', icon: '✅', bg: '#f0fdf4' },
    ABSENT: { label: '❌ Kelmadi', color: '#dc2626', icon: '❌', bg: '#fef2f2' },
    LATE: { label: '⏰ Kechikdi', color: '#d97706', icon: '⏰', bg: '#fffbeb' },
    EXCUSED: { label: '🔄 Sababli', color: '#2563eb', icon: '🔄', bg: '#eff6ff' },
}

export default function OfflineAttendanceManager() {
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [sessions, setSessions] = useState<Session[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [sessionDate, setSessionDate] = useState('')
    const [sessionTitle, setSessionTitle] = useState('')
    const [sessionNotes, setSessionNotes] = useState('')
    const [editingSession, setEditingSession] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [tabView, setTabView] = useState(0) // 0=sessions, 1=users
    const [historyUserId, setHistoryUserId] = useState<string | null>(null)

    // Load offline courses
    useEffect(() => {
        fetch('/api/admin/offline-attendance?action=courses')
            .then(r => r.json())
            .then(setCourses)
            .catch(() => { })
    }, [])

    // Load sessions and users when course selected
    const loadData = useCallback(async () => {
        if (!selectedCourse) return
        setLoading(true)
        try {
            const [sessRes, usersRes] = await Promise.all([
                fetch(`/api/admin/offline-attendance?courseId=${selectedCourse}`).then(r => r.json()),
                fetch(`/api/admin/offline-attendance?action=users&courseId=${selectedCourse}`).then(r => r.json()),
            ])
            setSessions(sessRes)
            setUsers(usersRes)
        } catch { }
        setLoading(false)
    }, [selectedCourse])

    useEffect(() => { loadData() }, [loadData])

    const createSession = async () => {
        if (!sessionDate || !selectedCourse) return
        setSaving(true)
        try {
            if (editingSession) {
                await fetch('/api/admin/offline-attendance', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: editingSession, date: sessionDate, title: sessionTitle, notes: sessionNotes }),
                })
            } else {
                await fetch('/api/admin/offline-attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'create-session', courseId: selectedCourse, date: sessionDate, title: sessionTitle, notes: sessionNotes }),
                })
            }
            setDialogOpen(false)
            setSessionDate('')
            setSessionTitle('')
            setSessionNotes('')
            setEditingSession(null)
            loadData()
        } catch { }
        setSaving(false)
    }

    const deleteSession = async (sessionId: string) => {
        if (!confirm("Bu mashg'ulotni o'chirmoqchimisiz?")) return
        await fetch(`/api/admin/offline-attendance?sessionId=${sessionId}`, { method: 'DELETE' })
        loadData()
    }

    const markAttendance = async (sessionId: string, userId: string, status: string) => {
        await fetch('/api/admin/offline-attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark-attendance', sessionId, attendances: [{ userId, status }] }),
        })
        loadData()
    }

    const bulkMark = async (sessionId: string, status: string) => {
        const userIds = users.map(u => u.id)
        await fetch('/api/admin/offline-attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'bulk-mark', sessionId, userIds, status }),
        })
        loadData()
    }

    const getUserAttendanceStats = (userId: string) => {
        let present = 0, absent = 0, late = 0, excused = 0
        sessions.forEach(s => {
            const att = s.attendances.find(a => a.userId === userId)
            if (att?.status === 'PRESENT') present++
            else if (att?.status === 'ABSENT') absent++
            else if (att?.status === 'LATE') late++
            else if (att?.status === 'EXCUSED') excused++
        })
        const total = sessions.length
        const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0
        return { present, absent, late, excused, total, percentage }
    }

    const getUserHistory = (userId: string) => {
        return sessions
            .map(s => {
                const att = s.attendances.find(a => a.userId === userId)
                return { date: s.date, title: s.title, status: att?.status || 'UNMARKED', note: att?.note }
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    const openEditDialog = (session: Session) => {
        setEditingSession(session.id)
        setSessionDate(session.date.split('T')[0])
        setSessionTitle(session.title || '')
        setSessionNotes(session.notes || '')
        setDialogOpen(true)
    }

    const formatDate = (d: string | null) => {
        if (!d) return '—'
        return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const historyUser = users.find(u => u.id === historyUserId)
    const historyData = historyUserId ? getUserHistory(historyUserId) : []
    const historyStats = historyUserId ? getUserAttendanceStats(historyUserId) : null

    return (
        <Box p={3} maxWidth={1400}>
            <Typography variant="h4" sx={{ color: '#114539', fontWeight: 800, mb: 1 }}>
                📋 Offline Davomat
            </Typography>
            <Typography variant="body2" sx={{ color: '#5a6b5a', mb: 3 }}>
                Offline kurslar uchun foydalanuvchilar davomatini boshqaring
            </Typography>

            {/* Course Selector */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Offline kursni tanlang</InputLabel>
                    <Select
                        value={selectedCourse}
                        label="Offline kursni tanlang"
                        onChange={e => setSelectedCourse(e.target.value)}
                    >
                        {courses.map(c => (
                            <MenuItem key={c.id} value={c.id}>
                                📚 {c.title} {c.location && `— 📍 ${c.location}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {!selectedCourse && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>Avval offline kursni tanlang</Alert>
            )}

            {selectedCourse && loading && (
                <Box textAlign="center" py={4}><CircularProgress sx={{ color: '#114539' }} /></Box>
            )}

            {selectedCourse && !loading && (
                <>
                    {/* Tab Navigation */}
                    <Paper sx={{ borderRadius: 3, mb: 3 }}>
                        <Tabs
                            value={tabView}
                            onChange={(_, v) => setTabView(v)}
                            sx={{
                                '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' },
                                '& .Mui-selected': { color: '#114539 !important' },
                                '& .MuiTabs-indicator': { bgcolor: '#114539' },
                            }}
                        >
                            <Tab icon={<CalendarMonthIcon />} iconPosition="start" label={`Mashg'ulotlar (${sessions.length})`} />
                            <Tab icon={<GroupIcon />} iconPosition="start" label={`Foydalanuvchilar (${users.length})`} />
                        </Tabs>
                    </Paper>

                    {/* ═══ TAB 0: Sessions / Attendance Marking ═══ */}
                    {tabView === 0 && (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>
                                    <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Mashg'ulotlar
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => { setEditingSession(null); setSessionDate(''); setSessionTitle(''); setSessionNotes(''); setDialogOpen(true) }}
                                    sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' }, borderRadius: 2, fontWeight: 700 }}
                                >
                                    Mashg'ulot qo'shish
                                </Button>
                            </Box>

                            {sessions.length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>Hali mashg'ulotlar yo'q. "Mashg'ulot qo'shish" tugmasini bosing.</Alert>
                            ) : (
                                /* Sessions as a table with dates as columns and users as rows */
                                <Paper sx={{ borderRadius: 3, overflow: 'auto', mb: 3 }}>
                                    <TableContainer>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, color: '#114539', minWidth: 180, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 3 }}>
                                                        Foydalanuvchi
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#114539', minWidth: 100 }}>
                                                        Obuna
                                                    </TableCell>
                                                    {sessions.map(s => (
                                                        <TableCell
                                                            key={s.id}
                                                            align="center"
                                                            sx={{ fontWeight: 600, color: '#114539', minWidth: 90, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                                        >
                                                            <Box>
                                                                {new Date(s.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
                                                            </Box>
                                                            <Box sx={{ fontSize: '0.65rem', color: '#888' }}>
                                                                {new Date(s.date).toLocaleDateString('uz-UZ', { weekday: 'short' })}
                                                            </Box>
                                                            <Box display="flex" gap={0.3} justifyContent="center" mt={0.5}>
                                                                <Tooltip title="Tahrirlash"><IconButton size="small" onClick={() => openEditDialog(s)}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                                                                <Tooltip title="O'chirish"><IconButton size="small" color="error" onClick={() => deleteSession(s.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    ))}
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#114539', minWidth: 70 }}>📊 %</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users.map(user => {
                                                    const stats = getUserAttendanceStats(user.id)
                                                    return (
                                                        <TableRow
                                                            key={user.id}
                                                            sx={{
                                                                '&:hover': { bgcolor: 'rgba(17,69,57,0.03)' },
                                                                ...(user.isExpired && {
                                                                    bgcolor: '#fef2f2',
                                                                    '& td': { borderBottom: '2px solid #ef4444' },
                                                                }),
                                                            }}
                                                        >
                                                            <TableCell sx={{ position: 'sticky', left: 0, bgcolor: user.isExpired ? '#fef2f2' : 'white', zIndex: 1 }}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: user.isExpired ? '#ef4444' : '#114539', fontSize: '0.75rem' }}>
                                                                        {(user.firstName?.[0] || '?').toUpperCase()}
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                                                            {user.firstName} {user.lastName}
                                                                        </Typography>
                                                                        {user.phone && <Typography variant="caption" color="text.secondary">{user.phone}</Typography>}
                                                                    </Box>
                                                                    {user.isExpired && (
                                                                        <Tooltip title="Obuna muddati tugagan!">
                                                                            <WarningIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                                                                        </Tooltip>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
                                                                    <Box sx={{ color: '#555' }}>{formatDate(user.subscriptionStart)}</Box>
                                                                    <Box sx={{ color: user.isExpired ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
                                                                        {user.subscriptionEnd ? `→ ${formatDate(user.subscriptionEnd)}` : '∞ Sotib olingan'}
                                                                    </Box>
                                                                </Box>
                                                            </TableCell>
                                                            {sessions.map(s => {
                                                                const att = s.attendances.find(a => a.userId === user.id)
                                                                const status = att?.status || 'UNMARKED'
                                                                const cfg = statusConfig[status]
                                                                // Check if session date is after subscription end
                                                                const sessionDate = new Date(s.date)
                                                                const isAfterExpiry = user.subscriptionEnd && sessionDate > new Date(user.subscriptionEnd)
                                                                return (
                                                                    <TableCell key={s.id} align="center" sx={{ p: 0.5 }}>
                                                                        {isAfterExpiry ? (
                                                                            <Tooltip title="Obuna tugagan — belgilab bo'lmaydi">
                                                                                <Box sx={{ color: '#ccc', fontSize: '1.2rem' }}>—</Box>
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Box display="flex" gap={0.3} justifyContent="center" flexWrap="wrap">
                                                                                {Object.entries(statusConfig).map(([st, c]) => (
                                                                                    <Tooltip key={st} title={c.label}>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            onClick={() => markAttendance(s.id, user.id, st)}
                                                                                            sx={{
                                                                                                width: 26, height: 26, fontSize: '12px',
                                                                                                bgcolor: status === st ? `${c.color}20` : 'transparent',
                                                                                                border: status === st ? `2px solid ${c.color}` : '1px solid #e5e5e5',
                                                                                            }}
                                                                                        >
                                                                                            {c.icon}
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                ))}
                                                                            </Box>
                                                                        )}
                                                                    </TableCell>
                                                                )
                                                            })}
                                                            <TableCell align="center">
                                                                <Chip
                                                                    label={`${stats.percentage}%`}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: stats.percentage >= 80 ? '#dcfce7' : stats.percentage >= 50 ? '#fef3c7' : '#fee2e2',
                                                                        color: stats.percentage >= 80 ? '#16a34a' : stats.percentage >= 50 ? '#d97706' : '#dc2626',
                                                                        fontWeight: 800, fontSize: '0.75rem',
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                                {/* Bulk actions row */}
                                                <TableRow sx={{ bgcolor: '#f8faf8' }}>
                                                    <TableCell colSpan={2} sx={{ fontWeight: 700, color: '#114539', position: 'sticky', left: 0, bgcolor: '#f8faf8', zIndex: 1 }}>
                                                        Barchasi uchun:
                                                    </TableCell>
                                                    {sessions.map(s => (
                                                        <TableCell key={s.id} align="center" sx={{ p: 0.5 }}>
                                                            <Box display="flex" gap={0.3} justifyContent="center">
                                                                <Tooltip title="Barchasini ✅ Keldi">
                                                                    <IconButton size="small" onClick={() => bulkMark(s.id, 'PRESENT')} sx={{ color: '#16a34a', width: 24, height: 24 }}>
                                                                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Barchasini ❌ Kelmadi">
                                                                    <IconButton size="small" onClick={() => bulkMark(s.id, 'ABSENT')} sx={{ color: '#dc2626', width: 24, height: 24 }}>
                                                                        <CancelIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    ))}
                                                    <TableCell />
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            )}
                        </>
                    )}

                    {/* ═══ TAB 1: Users with Subscription Info & Per-User History ═══ */}
                    {tabView === 1 && (
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>
                                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Foydalanuvchilar va obuna ma'lumotlari
                            </Typography>
                            {users.length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>Bu kursga obuna bo'lgan foydalanuvchilar yo'q.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ '& th': { fontWeight: 700, color: '#114539' } }}>
                                                <TableCell>Foydalanuvchi</TableCell>
                                                <TableCell>Telefon</TableCell>
                                                <TableCell>Obuna boshlanishi</TableCell>
                                                <TableCell>Obuna tugashi</TableCell>
                                                <TableCell align="center">Holat</TableCell>
                                                <TableCell align="center">✅</TableCell>
                                                <TableCell align="center">❌</TableCell>
                                                <TableCell align="center">⏰</TableCell>
                                                <TableCell align="center">📊 Foiz</TableCell>
                                                <TableCell align="center">Tarix</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.map(user => {
                                                const stats = getUserAttendanceStats(user.id)
                                                return (
                                                    <TableRow
                                                        key={user.id}
                                                        sx={{
                                                            '&:hover': { bgcolor: 'rgba(17,69,57,0.03)' },
                                                            ...(user.isExpired && {
                                                                bgcolor: '#fef2f2',
                                                                '& td': { borderBottom: '2px solid #ef4444' },
                                                            }),
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Avatar sx={{ width: 28, height: 28, bgcolor: user.isExpired ? '#ef4444' : '#114539', fontSize: '0.75rem' }}>
                                                                    {(user.firstName?.[0] || '?').toUpperCase()}
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {user.firstName} {user.lastName}
                                                                </Typography>
                                                                {user.isExpired && <WarningIcon sx={{ color: '#ef4444', fontSize: 16 }} />}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption">{user.phone || '—'}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontSize="0.8rem">{formatDate(user.subscriptionStart)}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontSize="0.8rem" sx={{ color: user.isExpired ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
                                                                {user.subscriptionEnd ? formatDate(user.subscriptionEnd) : '∞'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={user.isExpired ? 'Tugagan' : 'Aktiv'}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: user.isExpired ? '#fee2e2' : '#dcfce7',
                                                                    color: user.isExpired ? '#dc2626' : '#16a34a',
                                                                    fontWeight: 700, fontSize: '0.7rem',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={stats.present} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700 }} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={stats.absent} size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={stats.late} size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700 }} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={stats.percentage}
                                                                    sx={{
                                                                        flex: 1, height: 8, borderRadius: 4,
                                                                        bgcolor: '#f0f0f0',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: stats.percentage >= 80 ? '#16a34a' : stats.percentage >= 50 ? '#d97706' : '#dc2626',
                                                                            borderRadius: 4,
                                                                        },
                                                                    }}
                                                                />
                                                                <Typography variant="caption" fontWeight={800} sx={{ minWidth: 35 }}>
                                                                    {stats.percentage}%
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Davomatni ko'rish">
                                                                <IconButton size="small" onClick={() => setHistoryUserId(user.id)} sx={{ color: '#114539' }}>
                                                                    <HistoryIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    )}
                </>
            )}

            {/* Create/Edit Session Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#114539', fontWeight: 700 }}>
                    {editingSession ? "Mashg'ulotni tahrirlash" : "Yangi mashg'ulot"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        type="date"
                        label="Sana"
                        value={sessionDate}
                        onChange={e => setSessionDate(e.target.value)}
                        fullWidth
                        sx={{ mt: 1, mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Sarlavha (ixtiyoriy)"
                        value={sessionTitle}
                        onChange={e => setSessionTitle(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                        placeholder="Masalan: Dars #5 — Nafas olish texnikasi"
                    />
                    <TextField
                        label="Izoh (ixtiyoriy)"
                        value={sessionNotes}
                        onChange={e => setSessionNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
                    <Button
                        variant="contained"
                        onClick={createSession}
                        disabled={!sessionDate || saving}
                        sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' } }}
                    >
                        {saving ? <CircularProgress size={20} /> : editingSession ? 'Saqlash' : 'Yaratish'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══ Per-User Attendance History Dialog ═══ */}
            <Dialog open={!!historyUserId} onClose={() => setHistoryUserId(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ color: '#114539', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> {historyUser?.firstName} {historyUser?.lastName} — Davomat tarixi
                </DialogTitle>
                <DialogContent>
                    {historyStats && (
                        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                            {[
                                { label: 'Keldi', value: historyStats.present, color: '#16a34a', bg: '#dcfce7' },
                                { label: 'Kelmadi', value: historyStats.absent, color: '#dc2626', bg: '#fee2e2' },
                                { label: 'Kechikdi', value: historyStats.late, color: '#d97706', bg: '#fef3c7' },
                                { label: 'Sababli', value: historyStats.excused, color: '#2563eb', bg: '#eff6ff' },
                                { label: 'Foiz', value: `${historyStats.percentage}%`, color: historyStats.percentage >= 80 ? '#16a34a' : '#dc2626', bg: historyStats.percentage >= 80 ? '#dcfce7' : '#fee2e2' },
                            ].map(s => (
                                <Paper key={s.label} sx={{ p: 2, borderRadius: 2, bgcolor: s.bg, minWidth: 80, textAlign: 'center', flex: '1 1 auto' }}>
                                    <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                                    <Typography variant="caption" fontWeight={600} sx={{ color: s.color }}>{s.label}</Typography>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    {/* Progress Chart - Visual timeline */}
                    {historyData.length > 0 && (
                        <Box mb={3}>
                            <Typography variant="subtitle2" fontWeight={700} color="#114539" mb={1}>
                                📊 Davomat diagrammasi
                            </Typography>
                            <Box display="flex" gap={0.5} flexWrap="wrap" p={2} bgcolor="#f8faf8" borderRadius={2}>
                                {historyData.map((d, i) => {
                                    const cfg = statusConfig[d.status]
                                    return (
                                        <Tooltip key={i} title={`${new Date(d.date).toLocaleDateString('uz-UZ')} — ${cfg?.label || 'Belgilanmagan'}`}>
                                            <Box
                                                sx={{
                                                    width: 32, height: 32, borderRadius: 1,
                                                    bgcolor: cfg?.bg || '#f5f5f5',
                                                    border: `2px solid ${cfg?.color || '#e0e0e0'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '14px', cursor: 'pointer',
                                                    '&:hover': { transform: 'scale(1.15)' },
                                                    transition: 'transform 0.15s',
                                                }}
                                            >
                                                {cfg?.icon || '⬜'}
                                            </Box>
                                        </Tooltip>
                                    )
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* Detailed history table */}
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { fontWeight: 700, color: '#114539' } }}>
                                    <TableCell>#</TableCell>
                                    <TableCell>Sana</TableCell>
                                    <TableCell>Mashg'ulot</TableCell>
                                    <TableCell align="center">Holat</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historyData.map((d, i) => {
                                    const cfg = statusConfig[d.status]
                                    return (
                                        <TableRow key={i} sx={{ bgcolor: cfg?.bg || 'transparent' }}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>
                                                {new Date(d.date).toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </TableCell>
                                            <TableCell>{d.title || '—'}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={cfg?.label || '⬜ Belgilanmagan'}
                                                    size="small"
                                                    sx={{ bgcolor: `${cfg?.color}15` || '#f5f5f5', color: cfg?.color || '#888', fontWeight: 700 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Subscription info */}
                    {historyUser && (
                        <Box mt={3} p={2} bgcolor={historyUser.isExpired ? '#fef2f2' : '#f0fdf4'} borderRadius={2} border={`1px solid ${historyUser.isExpired ? '#fca5a5' : '#bbf7d0'}`}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: historyUser.isExpired ? '#dc2626' : '#16a34a' }}>
                                {historyUser.isExpired ? '⚠️ Obuna muddati tugagan' : '✅ Obuna faol'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Boshlanish: <strong>{formatDate(historyUser.subscriptionStart)}</strong> →
                                Tugash: <strong>{historyUser.subscriptionEnd ? formatDate(historyUser.subscriptionEnd) : '∞ Cheksiz'}</strong>
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryUserId(null)}>Yopish</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
