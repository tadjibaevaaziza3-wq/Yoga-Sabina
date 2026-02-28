'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Box, Typography, Paper, Button, IconButton, Chip, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, Tooltip, Avatar,
    Checkbox, FormControlLabel, FormGroup, Skeleton,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SaveIcon from '@mui/icons-material/Save'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PersonIcon from '@mui/icons-material/Person'
import WarningIcon from '@mui/icons-material/Warning'

// ─── Types ───
interface Course {
    id: string; title: string; titleRu?: string
    schedule?: string; times?: string; location?: string
}
interface User {
    id: string; firstName: string | null; lastName: string | null
    phone: string | null; telegramUsername?: string | null
    subscriptionEnd: string | null; isExpired: boolean
}
interface Attendance {
    userId: string; status: string
}
interface Session {
    id: string; date: string; title?: string
    attendances: Attendance[]
}

// ─── Constants ───
const DAYS_OF_WEEK = [
    { key: 1, uz: 'Dush', ru: 'Пн', full: 'Dushanba' },
    { key: 2, uz: 'Sesh', ru: 'Вт', full: 'Seshanba' },
    { key: 3, uz: 'Chor', ru: 'Ср', full: 'Chorshanba' },
    { key: 4, uz: 'Pay', ru: 'Чт', full: 'Payshanba' },
    { key: 5, uz: 'Juma', ru: 'Пт', full: 'Juma' },
    { key: 6, uz: 'Shan', ru: 'Сб', full: 'Shanba' },
    { key: 0, uz: 'Yak', ru: 'Вс', full: 'Yakshanba' },
]
const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']
const DAY_ABBR = ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha']

export default function OfflineAttendanceManager() {
    // ─── State ───
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState('')
    const [sessions, setSessions] = useState<Session[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [savingSchedule, setSavingSchedule] = useState(false)

    // Schedule config
    const [selectedDays, setSelectedDays] = useState<number[]>([])
    const [courseTime, setCourseTime] = useState('10:00')
    const [scheduleChanged, setScheduleChanged] = useState(false)

    // Month navigation
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth() + 1) // 1-based
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    // Saving attendance
    const [savingCell, setSavingCell] = useState<string | null>(null)

    // Pagination
    const [page, setPage] = useState(0)
    const PAGE_SIZE = 50
    const pagedUsers = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    const totalPages = Math.ceil(users.length / PAGE_SIZE)

    const selectedCourseObj = courses.find(c => c.id === selectedCourse)

    // ─── Load courses ───
    useEffect(() => {
        fetch('/api/admin/offline-attendance?action=courses')
            .then(r => r.json())
            .then(setCourses)
            .catch(() => { })
    }, [])

    // ─── When course changes, load its schedule ───
    useEffect(() => {
        if (!selectedCourseObj) return
        // Parse existing schedule to checkboxes
        const schedule = selectedCourseObj.schedule || ''
        const dayMap: Record<string, number> = {
            'du': 1, 'dush': 1, 'dushanba': 1, 'душанба': 1,
            'se': 2, 'sesh': 2, 'seshanba': 2, 'сешанба': 2,
            'chor': 3, 'chorshanba': 3, 'чоршанба': 3,
            'pay': 4, 'payshanba': 4, 'пайшанба': 4,
            'ju': 5, 'juma': 5, 'жума': 5,
            'sha': 6, 'shanba': 6, 'шанба': 6,
            'yak': 0, 'yakshanba': 0, 'якшанба': 0,
            'пн': 1, 'вт': 2, 'ср': 3, 'чт': 4, 'пт': 5, 'сб': 6, 'вс': 0,
        }
        const parts = schedule.toLowerCase().split(/[\/,\s\-]+/).filter(Boolean)
        const days: number[] = []
        parts.forEach(p => { if (dayMap[p] !== undefined) days.push(dayMap[p]) })
        setSelectedDays([...new Set(days)])

        // Parse time
        const times = selectedCourseObj.times || ''
        const timeMatch = times.match(/(\d{1,2}:\d{2})/)
        setCourseTime(timeMatch?.[1] || '10:00')
        setScheduleChanged(false)
    }, [selectedCourseObj?.id])

    // ─── Load data for selected month ───
    const loadData = useCallback(async () => {
        if (!selectedCourse) return
        setLoading(true)
        try {
            const [sessRes, usersRes] = await Promise.all([
                fetch(`/api/admin/offline-attendance?courseId=${selectedCourse}&month=${monthStr}`).then(r => r.json()),
                fetch(`/api/admin/offline-attendance?action=users&courseId=${selectedCourse}`).then(r => r.json()),
            ])
            setSessions(sessRes)
            setUsers(usersRes)
            setPage(0)
        } catch { }
        setLoading(false)
    }, [selectedCourse, monthStr])

    useEffect(() => { loadData() }, [loadData])

    // ─── Save schedule to course ───
    const saveSchedule = async () => {
        if (!selectedCourse) return
        setSavingSchedule(true)
        const dayNames = selectedDays
            .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
            .map(d => DAYS_OF_WEEK.find(dw => dw.key === d)?.full || '')
            .filter(Boolean)
        const schedule = dayNames.join(', ')
        const times = courseTime

        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update-schedule', courseId: selectedCourse, schedule, times }),
            })
            // Refresh courses
            const res = await fetch('/api/admin/offline-attendance?action=courses')
            setCourses(await res.json())
            setScheduleChanged(false)
        } catch { }
        setSavingSchedule(false)
    }

    // ─── Generate month sessions ───
    const generateMonth = async () => {
        if (!selectedCourse || selectedDays.length === 0) return
        // Save schedule first if changed
        if (scheduleChanged) await saveSchedule()
        setGenerating(true)
        try {
            const res = await fetch('/api/admin/offline-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate-month', courseId: selectedCourse, month: monthStr }),
            })
            const data = await res.json()
            if (data.success) loadData()
            else alert(data.error || 'Xatolik')
        } catch { }
        setGenerating(false)
    }

    // ─── Mark attendance (single cell) ───
    const markAttendance = async (sessionId: string, userId: string, newStatus: string) => {
        const cellKey = `${sessionId}-${userId}`
        setSavingCell(cellKey)
        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'mark-attendance',
                    sessionId,
                    attendances: [{ userId, status: newStatus }],
                }),
            })
            // Update local state immediately (no full reload)
            setSessions(prev => prev.map(s => {
                if (s.id !== sessionId) return s
                const existing = s.attendances.find(a => a.userId === userId)
                if (existing) {
                    return { ...s, attendances: s.attendances.map(a => a.userId === userId ? { ...a, status: newStatus } : a) }
                }
                return { ...s, attendances: [...s.attendances, { userId, status: newStatus }] }
            }))
        } catch { }
        setSavingCell(null)
    }

    // ─── Bulk mark all users for a session ───
    const bulkMark = async (sessionId: string, status: string) => {
        setSavingCell(`bulk-${sessionId}`)
        const userIds = users.map(u => u.id)
        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk-mark', sessionId, userIds, status }),
            })
            setSessions(prev => prev.map(s => {
                if (s.id !== sessionId) return s
                return { ...s, attendances: userIds.map(uid => ({ userId: uid, status })) }
            }))
        } catch { }
        setSavingCell(null)
    }

    // ─── Helpers ───
    const getAttendance = (sessionId: string, userId: string): string | null => {
        const session = sessions.find(s => s.id === sessionId)
        return session?.attendances.find(a => a.userId === userId)?.status || null
    }

    const getUserStats = (userId: string) => {
        let present = 0, absent = 0, total = sessions.length
        sessions.forEach(s => {
            const att = s.attendances.find(a => a.userId === userId)
            if (att?.status === 'PRESENT' || att?.status === 'LATE') present++
            else if (att?.status === 'ABSENT') absent++
        })
        const pct = total > 0 ? Math.round((present / total) * 100) : 0
        return { present, absent, total, pct }
    }

    const toggleDay = (dayKey: number) => {
        setSelectedDays(prev => prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey])
        setScheduleChanged(true)
    }

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

    // ─── RENDER ───
    return (
        <Box sx={{ maxWidth: 1600 }}>
            {/* ══════ STEP 1: Course Selector ══════ */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#888', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
                    1. Kursni tanlang
                </Typography>
                <FormControl fullWidth size="small">
                    <InputLabel>Offline kurs</InputLabel>
                    <Select
                        value={selectedCourse}
                        label="Offline kurs"
                        onChange={e => setSelectedCourse(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        {courses.map(c => (
                            <MenuItem key={c.id} value={c.id}>
                                📚 {c.title} {c.location && `— 📍 ${c.location}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {/* ══════ STEP 1b: Schedule Configuration ══════ */}
            {selectedCourse && (
                <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#888', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
                        2. Jadval sozlamalari
                    </Typography>

                    {/* Days of Week */}
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>
                        Hafta kunlari:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        {DAYS_OF_WEEK.map(day => {
                            const isSelected = selectedDays.includes(day.key)
                            return (
                                <Button
                                    key={day.key}
                                    variant={isSelected ? 'contained' : 'outlined'}
                                    onClick={() => toggleDay(day.key)}
                                    sx={{
                                        minWidth: 56, height: 48,
                                        borderRadius: 2,
                                        fontWeight: 800,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        ...(isSelected ? {
                                            bgcolor: '#114539',
                                            color: 'white',
                                            '&:hover': { bgcolor: '#0a8069' },
                                            boxShadow: '0 2px 8px rgba(17,69,57,0.3)',
                                        } : {
                                            borderColor: '#e0e0e0',
                                            color: '#999',
                                            '&:hover': { borderColor: '#114539', color: '#114539' },
                                        }),
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ fontSize: '0.8rem', lineHeight: 1 }}>{day.uz}</Box>
                                        <Box sx={{ fontSize: '0.6rem', opacity: 0.6 }}>{day.ru}</Box>
                                    </Box>
                                </Button>
                            )
                        })}
                    </Box>

                    {/* Time */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#555' }}>
                                <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} /> Mashg'ulot vaqti:
                            </Typography>
                            <TextField
                                type="time"
                                size="small"
                                value={courseTime}
                                onChange={e => { setCourseTime(e.target.value); setScheduleChanged(true) }}
                                sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Box>

                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                            {scheduleChanged && (
                                <Button
                                    variant="contained"
                                    startIcon={savingSchedule ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                    onClick={saveSchedule}
                                    disabled={savingSchedule}
                                    sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' }, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                                >
                                    Saqlash
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Current schedule display */}
                    {selectedDays.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            <Chip
                                icon={<ScheduleIcon />}
                                label={selectedDays
                                    .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
                                    .map(d => DAYS_OF_WEEK.find(dw => dw.key === d)?.full)
                                    .join(', ')}
                                sx={{ fontWeight: 600, bgcolor: '#e8f5e9', color: '#2e7d32' }}
                            />
                            <Chip label={`🕐 ${courseTime}`} sx={{ fontWeight: 600 }} />
                        </Box>
                    )}
                </Paper>
            )}

            {/* ══════ Month Navigator + Generate ══════ */}
            {selectedCourse && (
                <Paper sx={{ p: 2, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" sx={{ color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem', mr: 1 }}>
                        3.
                    </Typography>
                    <IconButton onClick={prevMonth} size="small"><NavigateBeforeIcon /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#114539', minWidth: 150, textAlign: 'center' }}>
                        {MONTHS[month - 1]} {year}
                    </Typography>
                    <IconButton onClick={nextMonth} size="small"><NavigateNextIcon /></IconButton>

                    <Box flex={1} />

                    <Button
                        variant="contained"
                        startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
                        onClick={generateMonth}
                        disabled={generating || selectedDays.length === 0}
                        sx={{
                            bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' },
                            fontWeight: 700, borderRadius: 2, textTransform: 'none',
                            px: 3,
                        }}
                    >
                        {generating ? 'Yaratilmoqda...' : `Jadval yaratish (${MONTHS[month - 1]})`}
                    </Button>
                </Paper>
            )}

            {/* ══════ Loading ══════ */}
            {selectedCourse && loading && (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height={48} sx={{ borderRadius: 1 }} />)}
                </Paper>
            )}

            {/* ══════ STEP 3: Attendance Table ══════ */}
            {selectedCourse && !loading && (
                <>
                    {sessions.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                            {selectedDays.length === 0
                                ? "Avval hafta kunlarini tanlang, keyin jadval yarating."
                                : `${MONTHS[month - 1]} oyi uchun jadval yaratilmagan. "Jadval yaratish" tugmasini bosing.`}
                        </Alert>
                    ) : users.length === 0 ? (
                        <Alert severity="warning" sx={{ borderRadius: 3 }}>
                            Bu kursga obuna bo'lgan foydalanuvchilar yo'q.
                        </Alert>
                    ) : (
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            {/* Table header info */}
                            <Box sx={{ px: 3, py: 2, bgcolor: '#f8faf8', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PersonIcon sx={{ color: '#114539' }} />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#114539' }}>
                                    {users.length} {users.length === 1 ? "foydalanuvchi" : "foydalanuvchi"} · {sessions.length} kun
                                </Typography>
                                {totalPages > 1 && (
                                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Button size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>◀</Button>
                                        <Typography variant="caption" fontWeight={700}>{page + 1}/{totalPages}</Typography>
                                        <Button size="small" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>▶</Button>
                                    </Box>
                                )}
                            </Box>

                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {/* Sticky student column */}
                                            <TableCell sx={{
                                                fontWeight: 700, color: '#114539', minWidth: 200,
                                                position: 'sticky', left: 0, bgcolor: 'white', zIndex: 3,
                                                borderRight: '2px solid #e5e7eb',
                                            }}>
                                                Talaba
                                            </TableCell>

                                            {/* Date columns */}
                                            {sessions.map(s => {
                                                const d = new Date(s.date)
                                                const dayNum = d.getDate()
                                                const monthShort = MONTHS[d.getMonth()].slice(0, 3)
                                                const dayAbbr = DAY_ABBR[d.getDay()]
                                                const isToday = d.toDateString() === new Date().toDateString()
                                                const isPast = d < new Date(new Date().setHours(0, 0, 0, 0))

                                                return (
                                                    <TableCell
                                                        key={s.id}
                                                        align="center"
                                                        sx={{
                                                            minWidth: 64, maxWidth: 64, p: '4px',
                                                            bgcolor: isToday ? '#114539' : isPast ? '#fafafa' : 'white',
                                                            color: isToday ? 'white' : '#114539',
                                                            borderBottom: isToday ? '3px solid #0a8069' : undefined,
                                                        }}
                                                    >
                                                        <Box sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.1 }}>{dayNum}</Box>
                                                        <Box sx={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.6 }}>{monthShort}</Box>
                                                        <Box sx={{ fontSize: '0.55rem', fontWeight: 500, opacity: 0.4 }}>{dayAbbr}</Box>
                                                    </TableCell>
                                                )
                                            })}

                                            {/* Stats column */}
                                            <TableCell align="center" sx={{
                                                fontWeight: 700, color: '#114539', minWidth: 70,
                                                borderLeft: '2px solid #e5e7eb',
                                            }}>
                                                📊
                                            </TableCell>
                                        </TableRow>

                                        {/* Bulk actions row */}
                                        <TableRow>
                                            <TableCell sx={{
                                                position: 'sticky', left: 0, bgcolor: '#f8faf8', zIndex: 3,
                                                borderRight: '2px solid #e5e7eb',
                                                fontSize: '0.7rem', fontWeight: 600, color: '#999',
                                            }}>
                                                Barchasi:
                                            </TableCell>
                                            {sessions.map(s => (
                                                <TableCell key={s.id} align="center" sx={{ bgcolor: '#f8faf8', p: '2px' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                                                        <Tooltip title="Barchasi ✅">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => bulkMark(s.id, 'PRESENT')}
                                                                sx={{ width: 22, height: 22, color: '#16a34a', '& svg': { fontSize: 14 } }}
                                                            >
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Barchasi ❌">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => bulkMark(s.id, 'ABSENT')}
                                                                sx={{ width: 22, height: 22, color: '#dc2626', '& svg': { fontSize: 14 } }}
                                                            >
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            ))}
                                            <TableCell sx={{ bgcolor: '#f8faf8', borderLeft: '2px solid #e5e7eb' }} />
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {pagedUsers.map((user, userIdx) => {
                                            const stats = getUserStats(user.id)
                                            return (
                                                <TableRow
                                                    key={user.id}
                                                    sx={{
                                                        '&:hover td': { bgcolor: 'rgba(17,69,57,0.02) !important' },
                                                        ...(user.isExpired && { '& td': { borderBottom: '2px solid #fca5a5' } }),
                                                    }}
                                                >
                                                    {/* Student name — sticky */}
                                                    <TableCell sx={{
                                                        position: 'sticky', left: 0, zIndex: 1,
                                                        bgcolor: user.isExpired ? '#fef2f2' : 'white',
                                                        borderRight: '2px solid #e5e7eb',
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar sx={{
                                                                width: 28, height: 28,
                                                                bgcolor: user.isExpired ? '#ef4444' : '#114539',
                                                                fontSize: '0.7rem', fontWeight: 800,
                                                            }}>
                                                                {(user.firstName?.[0] || '?').toUpperCase()}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.2, color: '#333' }}>
                                                                    {user.firstName} {user.lastName}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#999' }}>
                                                                    {user.phone || user.telegramUsername || '—'}
                                                                </Typography>
                                                            </Box>
                                                            {user.isExpired && (
                                                                <Tooltip title="Obuna tugagan">
                                                                    <WarningIcon sx={{ color: '#ef4444', fontSize: 16, ml: 'auto' }} />
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </TableCell>

                                                    {/* Attendance cells */}
                                                    {sessions.map(s => {
                                                        const status = getAttendance(s.id, user.id)
                                                        const cellKey = `${s.id}-${user.id}`
                                                        const isSaving = savingCell === cellKey
                                                        const sessionDate = new Date(s.date)
                                                        const isAfterExpiry = user.subscriptionEnd && sessionDate > new Date(user.subscriptionEnd)

                                                        if (isAfterExpiry) {
                                                            return (
                                                                <TableCell key={s.id} align="center" sx={{ bgcolor: '#f5f5f5', p: 0 }}>
                                                                    <Box sx={{ color: '#ddd', fontSize: 12 }}>—</Box>
                                                                </TableCell>
                                                            )
                                                        }

                                                        return (
                                                            <TableCell key={s.id} align="center" sx={{
                                                                p: 0, cursor: 'pointer',
                                                                bgcolor: status === 'PRESENT' ? '#f0fdf4'
                                                                    : status === 'ABSENT' ? '#fef2f2'
                                                                        : status === 'LATE' ? '#fffbeb'
                                                                            : 'transparent',
                                                            }}>
                                                                {isSaving ? (
                                                                    <CircularProgress size={16} sx={{ color: '#114539' }} />
                                                                ) : (
                                                                    <Tooltip title={
                                                                        status === 'PRESENT' ? '✅ Keldi → ❌ Kelmadi'
                                                                            : status === 'ABSENT' ? '❌ Kelmadi → ⬜ Belgilanmagan'
                                                                                : '⬜ → ✅ Keldi'
                                                                    }>
                                                                        <Box
                                                                            onClick={() => {
                                                                                const next = status === null ? 'PRESENT'
                                                                                    : status === 'PRESENT' ? 'ABSENT'
                                                                                        : 'PRESENT' // cycle back
                                                                                markAttendance(s.id, user.id, next)
                                                                            }}
                                                                            sx={{
                                                                                width: '100%', minHeight: 40,
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                fontSize: 20,
                                                                                '&:hover': { transform: 'scale(1.15)', bgcolor: 'rgba(17,69,57,0.04)' },
                                                                                transition: 'all 0.1s ease',
                                                                                userSelect: 'none',
                                                                            }}
                                                                        >
                                                                            {status === 'PRESENT' ? '✅'
                                                                                : status === 'ABSENT' ? '❌'
                                                                                    : status === 'LATE' ? '⏰'
                                                                                        : '⬜'}
                                                                        </Box>
                                                                    </Tooltip>
                                                                )}
                                                            </TableCell>
                                                        )
                                                    })}

                                                    {/* Stats chip */}
                                                    <TableCell align="center" sx={{ borderLeft: '2px solid #e5e7eb' }}>
                                                        <Chip
                                                            label={`${stats.pct}%`}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 800, fontSize: '0.7rem',
                                                                bgcolor: stats.pct >= 80 ? '#dcfce7' : stats.pct >= 50 ? '#fef3c7' : '#fee2e2',
                                                                color: stats.pct >= 80 ? '#16a34a' : stats.pct >= 50 ? '#d97706' : '#dc2626',
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Legend */}
                            <Box sx={{ px: 3, py: 2, bgcolor: '#f8faf8', borderTop: '1px solid #eee', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                {[
                                    { icon: '✅', label: 'Keldi', color: '#16a34a' },
                                    { icon: '❌', label: 'Kelmadi', color: '#dc2626' },
                                    { icon: '⏰', label: 'Kechikdi', color: '#d97706' },
                                    { icon: '⬜', label: 'Belgilanmagan', color: '#999' },
                                ].map(l => (
                                    <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <span style={{ fontSize: 14 }}>{l.icon}</span>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: l.color }}>{l.label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}
                </>
            )}
        </Box>
    )
}
