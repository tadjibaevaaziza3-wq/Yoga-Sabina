'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Box, Typography, Paper, Button, IconButton, Chip, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, Divider, Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ScheduleIcon from '@mui/icons-material/Schedule'
import GroupIcon from '@mui/icons-material/Group'

interface Course { id: string; title: string; titleRu?: string; schedule?: string; location?: string }
interface User { id: string; firstName: string | null; lastName: string | null; phone: string | null }
interface Attendance { id: string; userId: string; status: string; note?: string; user: { id: string; firstName: string | null; lastName: string | null } }
interface Session { id: string; courseId: string; date: string; title?: string; notes?: string; attendances: Attendance[] }

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    PRESENT: { label: '✅ Keldi', color: '#16a34a', icon: '✅' },
    ABSENT: { label: '❌ Kelmadi', color: '#dc2626', icon: '❌' },
    LATE: { label: '⏰ Kechikdi', color: '#d97706', icon: '⏰' },
    EXCUSED: { label: '🔄 Sababli', color: '#2563eb', icon: '🔄' },
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
        let present = 0, absent = 0, late = 0
        sessions.forEach(s => {
            const att = s.attendances.find(a => a.userId === userId)
            if (att?.status === 'PRESENT') present++
            else if (att?.status === 'ABSENT') absent++
            else if (att?.status === 'LATE') late++
        })
        const total = sessions.length
        const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0
        return { present, absent, late, total, percentage }
    }

    const openEditDialog = (session: Session) => {
        setEditingSession(session.id)
        setSessionDate(session.date.split('T')[0])
        setSessionTitle(session.title || '')
        setSessionNotes(session.notes || '')
        setDialogOpen(true)
    }

    return (
        <Box p={3} maxWidth={1200}>
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
                    {/* User Attendance Summary */}
                    {users.length > 0 && sessions.length > 0 && (
                        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                            <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>
                                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Foydalanuvchilar statistikasi
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& th': { fontWeight: 700, color: '#114539' } }}>
                                            <TableCell>Foydalanuvchi</TableCell>
                                            <TableCell align="center">✅ Keldi</TableCell>
                                            <TableCell align="center">❌ Kelmadi</TableCell>
                                            <TableCell align="center">⏰ Kechikdi</TableCell>
                                            <TableCell align="center">📊 Foiz</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map(user => {
                                            const stats = getUserAttendanceStats(user.id)
                                            return (
                                                <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(17,69,57,0.03)' } }}>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {user.firstName} {user.lastName}
                                                        </Typography>
                                                        {user.phone && <Typography variant="caption" color="text.secondary">{user.phone}</Typography>}
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
                                                        <Chip
                                                            label={`${stats.percentage}%`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: stats.percentage >= 80 ? '#dcfce7' : stats.percentage >= 50 ? '#fef3c7' : '#fee2e2',
                                                                color: stats.percentage >= 80 ? '#16a34a' : stats.percentage >= 50 ? '#d97706' : '#dc2626',
                                                                fontWeight: 800,
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* Sessions */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700 }}>
                            <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Mashg'ulotlar ({sessions.length})
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
                        sessions.map(session => (
                            <Paper key={session.id} sx={{ p: 3, borderRadius: 3, mb: 2, border: '1px solid rgba(17,69,57,0.1)' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700} color="#114539">
                                            📅 {new Date(session.date).toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </Typography>
                                        {session.title && <Typography variant="body2" color="text.secondary">{session.title}</Typography>}
                                    </Box>
                                    <Box display="flex" gap={0.5}>
                                        <Tooltip title="Barchasini keldi deb belgilash">
                                            <IconButton size="small" onClick={() => bulkMark(session.id, 'PRESENT')} sx={{ color: '#16a34a' }}>
                                                <CheckCircleIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Barchasini kelmadi deb belgilash">
                                            <IconButton size="small" onClick={() => bulkMark(session.id, 'ABSENT')} sx={{ color: '#dc2626' }}>
                                                <CancelIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small" onClick={() => openEditDialog(session)}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => deleteSession(session.id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Attendance Grid */}
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {users.map(user => {
                                        const att = session.attendances.find(a => a.userId === user.id)
                                        const currentStatus = att?.status || 'UNMARKED'
                                        return (
                                            <Paper
                                                key={user.id}
                                                sx={{
                                                    p: 1.5, borderRadius: 2, minWidth: 160, flex: '1 1 auto',
                                                    border: `2px solid ${currentStatus === 'PRESENT' ? '#16a34a' : currentStatus === 'ABSENT' ? '#dc2626' : currentStatus === 'LATE' ? '#d97706' : '#e0e0e0'}`,
                                                    bgcolor: currentStatus === 'PRESENT' ? '#f0fdf4' : currentStatus === 'ABSENT' ? '#fef2f2' : currentStatus === 'LATE' ? '#fffbeb' : '#fafafa',
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={600} mb={1}>
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                                <Box display="flex" gap={0.5}>
                                                    {Object.entries(statusConfig).map(([status, config]) => (
                                                        <Tooltip key={status} title={config.label}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => markAttendance(session.id, user.id, status)}
                                                                sx={{
                                                                    bgcolor: currentStatus === status ? `${config.color}20` : 'transparent',
                                                                    border: currentStatus === status ? `2px solid ${config.color}` : '1px solid #e0e0e0',
                                                                    fontSize: '14px', width: 32, height: 32,
                                                                }}
                                                            >
                                                                {config.icon}
                                                            </IconButton>
                                                        </Tooltip>
                                                    ))}
                                                </Box>
                                            </Paper>
                                        )
                                    })}
                                </Box>
                            </Paper>
                        ))
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
        </Box>
    )
}
