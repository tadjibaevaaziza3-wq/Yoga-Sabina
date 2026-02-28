'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Box, Typography, Paper, Button, IconButton, Chip, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, Tooltip, Avatar,
    LinearProgress, Tabs, Tab,
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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SettingsIcon from '@mui/icons-material/Settings'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

interface Course {
    id: string; title: string; titleRu?: string
    schedule?: string; scheduleRu?: string
    times?: string; timesRu?: string
    location?: string; locationRu?: string
}
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

const MONTH_NAMES = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']
const DAY_NAMES_SHORT = ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha']

export default function OfflineAttendanceManager() {
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState<string>('')
    const [sessions, setSessions] = useState<Session[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [saving, setSaving] = useState(false)

    // Month navigation
    const now = new Date()
    const [currentYear, setCurrentYear] = useState(now.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1) // 1-based

    // Schedule editor
    const [scheduleDialog, setScheduleDialog] = useState(false)
    const [scheduleInput, setScheduleInput] = useState('')
    const [timesInput, setTimesInput] = useState('')

    // Session dialog
    const [sessionDialog, setSessionDialog] = useState(false)
    const [sessionDate, setSessionDate] = useState('')
    const [sessionTitle, setSessionTitle] = useState('')

    // History dialog
    const [historyUserId, setHistoryUserId] = useState<string | null>(null)

    // Tab
    const [tabView, setTabView] = useState(0) // 0=calendar, 1=users

    const selectedCourseObj = courses.find(c => c.id === selectedCourse)
    const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

    useEffect(() => {
        fetch('/api/admin/offline-attendance?action=courses')
            .then(r => r.json())
            .then(setCourses)
            .catch(() => { })
    }, [])

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
        } catch { }
        setLoading(false)
    }, [selectedCourse, monthStr])

    useEffect(() => { loadData() }, [loadData])

    const generateMonth = async () => {
        if (!selectedCourse) return
        setGenerating(true)
        try {
            const res = await fetch('/api/admin/offline-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate-month', courseId: selectedCourse, month: monthStr }),
            })
            const data = await res.json()
            if (data.success) {
                loadData()
            } else {
                alert(data.error || 'Xatolik')
            }
        } catch { }
        setGenerating(false)
    }

    const saveSchedule = async () => {
        setSaving(true)
        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update-schedule', courseId: selectedCourse, schedule: scheduleInput, times: timesInput }),
            })
            // Refresh courses
            const res = await fetch('/api/admin/offline-attendance?action=courses')
            const updated = await res.json()
            setCourses(updated)
            setScheduleDialog(false)
        } catch { }
        setSaving(false)
    }

    const createSession = async () => {
        if (!sessionDate || !selectedCourse) return
        setSaving(true)
        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create-session', courseId: selectedCourse, date: sessionDate, title: sessionTitle }),
            })
            setSessionDialog(false)
            setSessionDate('')
            setSessionTitle('')
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

    const getUserStats = (userId: string) => {
        let present = 0, absent = 0, late = 0, excused = 0
        sessions.forEach(s => {
            const att = s.attendances.find(a => a.userId === userId)
            if (att?.status === 'PRESENT') present++
            else if (att?.status === 'ABSENT') absent++
            else if (att?.status === 'LATE') late++
            else if (att?.status === 'EXCUSED') excused++
        })
        const total = sessions.length
        const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0
        return { present, absent, late, excused, total, pct }
    }

    const getUserHistory = (userId: string) =>
        sessions.map(s => {
            const att = s.attendances.find(a => a.userId === userId)
            return { date: s.date, title: s.title, status: att?.status || 'UNMARKED' }
        })

    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

    const prevMonth = () => {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }

    const historyUser = users.find(u => u.id === historyUserId)
    const historyData = historyUserId ? getUserHistory(historyUserId) : []
    const historyStats = historyUserId ? getUserStats(historyUserId) : null

    return (
        <Box p={3} maxWidth={1600}>
            <Typography variant="h4" sx={{ color: '#114539', fontWeight: 800, mb: 1 }}>
                📋 Offline Davomat
            </Typography>
            <Typography variant="body2" sx={{ color: '#5a6b5a', mb: 3 }}>
                Offline kurslar uchun kunlik davomat jadvali
            </Typography>

            {/* Course Selector */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Offline kursni tanlang</InputLabel>
                    <Select
                        value={selectedCourse}
                        label="Offline kursni tanlang"
                        onChange={e => { setSelectedCourse(e.target.value); setTabView(0) }}
                    >
                        {courses.map(c => (
                            <MenuItem key={c.id} value={c.id}>
                                📚 {c.title} {c.location && `— 📍 ${c.location}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Schedule info */}
                {selectedCourseObj && (
                    <Box mt={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <Chip
                            icon={<ScheduleIcon />}
                            label={selectedCourseObj.schedule || '📅 Jadval belgilanmagan'}
                            sx={{ fontWeight: 700, bgcolor: selectedCourseObj.schedule ? '#dcfce7' : '#fef3c7', color: selectedCourseObj.schedule ? '#16a34a' : '#d97706' }}
                        />
                        {selectedCourseObj.times && (
                            <Chip label={`🕐 ${selectedCourseObj.times}`} sx={{ fontWeight: 600 }} />
                        )}
                        <Button
                            size="small"
                            startIcon={<SettingsIcon />}
                            onClick={() => {
                                setScheduleInput(selectedCourseObj.schedule || '')
                                setTimesInput(selectedCourseObj.times || '')
                                setScheduleDialog(true)
                            }}
                            sx={{ fontWeight: 700, color: '#114539' }}
                        >
                            Jadvalni sozlash
                        </Button>
                    </Box>
                )}
            </Paper>

            {!selectedCourse && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>Avval offline kursni tanlang</Alert>
            )}

            {selectedCourse && loading && (
                <Box textAlign="center" py={4}><CircularProgress sx={{ color: '#114539' }} /></Box>
            )}

            {selectedCourse && !loading && (
                <>
                    {/* Month Navigator + Actions */}
                    <Paper sx={{ p: 2, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <IconButton onClick={prevMonth}><NavigateBeforeIcon /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#114539', minWidth: 160, textAlign: 'center' }}>
                            {MONTH_NAMES[currentMonth - 1]} {currentYear}
                        </Typography>
                        <IconButton onClick={nextMonth}><NavigateNextIcon /></IconButton>

                        <Box flex={1} />

                        <Button
                            variant="outlined"
                            startIcon={<AutoFixHighIcon />}
                            onClick={generateMonth}
                            disabled={generating || !selectedCourseObj?.schedule}
                            sx={{ fontWeight: 700, borderColor: '#114539', color: '#114539', '&:hover': { bgcolor: '#114539', color: 'white' } }}
                        >
                            {generating ? <CircularProgress size={18} /> : "Oylik jadval yaratish"}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => { setSessionDate(''); setSessionTitle(''); setSessionDialog(true) }}
                            sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' }, fontWeight: 700, borderRadius: 2 }}
                        >
                            Kun qo'shish
                        </Button>
                    </Paper>

                    {/* Tabs */}
                    <Paper sx={{ borderRadius: 3, mb: 3 }}>
                        <Tabs
                            value={tabView}
                            onChange={(_, v) => setTabView(v)}
                            sx={{
                                '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' },
                                '& .Mui-selected': { color: '#114539 !important' },
                                '& .MuiTabs-indicator': { bgcolor: '#114539' },
                            }}
                        >
                            <Tab icon={<CalendarMonthIcon />} iconPosition="start" label={`Davomat (${sessions.length} kun)`} />
                            <Tab icon={<GroupIcon />} iconPosition="start" label={`Foydalanuvchilar (${users.length})`} />
                        </Tabs>
                    </Paper>

                    {/* ═══ TAB 0: Monthly Calendar Davomat Grid ═══ */}
                    {tabView === 0 && (
                        <>
                            {sessions.length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    {selectedCourseObj?.schedule
                                        ? "Bu oy uchun jadval yo'q. \"Oylik jadval yaratish\" tugmasini bosing."
                                        : "Avval kurs jadvalini sozlang (masalan: Du/Chor/Juma), keyin oylik jadval yaratasiz."}
                                </Alert>
                            ) : (
                                <Paper sx={{ borderRadius: 3, overflow: 'auto' }}>
                                    <TableContainer>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    {/* User column */}
                                                    <TableCell sx={{
                                                        fontWeight: 700, color: '#114539', minWidth: 180,
                                                        position: 'sticky', left: 0, bgcolor: 'white', zIndex: 3, borderRight: '2px solid #e5e5e5'
                                                    }}>
                                                        Foydalanuvchi
                                                    </TableCell>
                                                    {/* Date columns */}
                                                    {sessions.map(s => {
                                                        const d = new Date(s.date)
                                                        const dayNum = d.getDate()
                                                        const dayName = DAY_NAMES_SHORT[d.getDay()]
                                                        const isPast = d < new Date(new Date().setHours(0, 0, 0, 0))
                                                        const isToday = d.toDateString() === new Date().toDateString()
                                                        return (
                                                            <TableCell
                                                                key={s.id}
                                                                align="center"
                                                                sx={{
                                                                    minWidth: 56, maxWidth: 56, p: 0.5,
                                                                    fontWeight: isToday ? 800 : 600,
                                                                    color: isToday ? 'white' : '#114539',
                                                                    bgcolor: isToday ? '#114539' : isPast ? '#fafafa' : 'white',
                                                                    borderBottom: isToday ? '3px solid #0a8069' : undefined,
                                                                    fontSize: '0.7rem',
                                                                }}
                                                            >
                                                                <Box>{dayNum}</Box>
                                                                <Box sx={{ fontSize: '0.6rem', opacity: 0.7 }}>{dayName}</Box>
                                                                <Box display="flex" justifyContent="center" gap={0.2} mt={0.3}>
                                                                    <Tooltip title="O'chirish">
                                                                        <IconButton size="small" onClick={() => deleteSession(s.id)}
                                                                            sx={{ width: 16, height: 16, '& svg': { fontSize: 10 }, color: isToday ? 'white' : '#ccc' }}>
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                        )
                                                    })}
                                                    {/* Stats column */}
                                                    <TableCell align="center" sx={{ fontWeight: 700, color: '#114539', minWidth: 60, borderLeft: '2px solid #e5e5e5' }}>
                                                        📊 %
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users.map(user => {
                                                    const stats = getUserStats(user.id)
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
                                                            {/* User info */}
                                                            <TableCell sx={{
                                                                position: 'sticky', left: 0,
                                                                bgcolor: user.isExpired ? '#fef2f2' : 'white',
                                                                zIndex: 1, borderRight: '2px solid #e5e5e5'
                                                            }}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: user.isExpired ? '#ef4444' : '#114539', fontSize: '0.65rem' }}>
                                                                        {(user.firstName?.[0] || '?').toUpperCase()}
                                                                    </Avatar>
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600} fontSize="0.75rem" lineHeight={1.2}>
                                                                            {user.firstName} {user.lastName}
                                                                        </Typography>
                                                                        <Typography variant="caption" fontSize="0.6rem" color="text.secondary">
                                                                            {user.subscriptionEnd ? `→ ${formatDate(user.subscriptionEnd)}` : '∞'}
                                                                        </Typography>
                                                                    </Box>
                                                                    {user.isExpired && <WarningIcon sx={{ color: '#ef4444', fontSize: 14 }} />}
                                                                </Box>
                                                            </TableCell>

                                                            {/* Attendance cells */}
                                                            {sessions.map(s => {
                                                                const att = s.attendances.find(a => a.userId === user.id)
                                                                const status = att?.status || 'UNMARKED'
                                                                const sessionDate = new Date(s.date)
                                                                const isAfterExpiry = user.subscriptionEnd && sessionDate > new Date(user.subscriptionEnd)

                                                                if (isAfterExpiry) {
                                                                    return (
                                                                        <TableCell key={s.id} align="center" sx={{ p: 0, bgcolor: '#f5f5f5' }}>
                                                                            <Box sx={{ color: '#ccc', fontSize: '0.7rem' }}>—</Box>
                                                                        </TableCell>
                                                                    )
                                                                }

                                                                return (
                                                                    <TableCell key={s.id} align="center" sx={{
                                                                        p: 0, cursor: 'pointer',
                                                                        bgcolor: statusConfig[status]?.bg || 'transparent',
                                                                    }}>
                                                                        {/* Cycle through statuses on click */}
                                                                        <Tooltip title={`${user.firstName}: ${statusConfig[status]?.label || 'Belgilanmagan'}`}>
                                                                            <Box
                                                                                onClick={() => {
                                                                                    const order = ['UNMARKED', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
                                                                                    const nextIdx = (order.indexOf(status) + 1) % order.length
                                                                                    const nextStatus = order[nextIdx]
                                                                                    if (nextStatus === 'UNMARKED') {
                                                                                        // Remove attendance by marking present then we handle it
                                                                                        markAttendance(s.id, user.id, 'PRESENT')
                                                                                    } else {
                                                                                        markAttendance(s.id, user.id, nextStatus)
                                                                                    }
                                                                                }}
                                                                                sx={{
                                                                                    width: '100%', minHeight: 32,
                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                    fontSize: '16px',
                                                                                    '&:hover': { transform: 'scale(1.2)' },
                                                                                    transition: 'transform 0.1s',
                                                                                }}
                                                                            >
                                                                                {statusConfig[status]?.icon || '⬜'}
                                                                            </Box>
                                                                        </Tooltip>
                                                                    </TableCell>
                                                                )
                                                            })}

                                                            {/* Stats */}
                                                            <TableCell align="center" sx={{ borderLeft: '2px solid #e5e5e5' }}>
                                                                <Chip
                                                                    label={`${stats.pct}%`}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: stats.pct >= 80 ? '#dcfce7' : stats.pct >= 50 ? '#fef3c7' : '#fee2e2',
                                                                        color: stats.pct >= 80 ? '#16a34a' : stats.pct >= 50 ? '#d97706' : '#dc2626',
                                                                        fontWeight: 800, fontSize: '0.7rem',
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}

                                                {/* Bulk actions row */}
                                                <TableRow sx={{ bgcolor: '#f8faf8' }}>
                                                    <TableCell sx={{ fontWeight: 700, color: '#114539', position: 'sticky', left: 0, bgcolor: '#f8faf8', zIndex: 1, borderRight: '2px solid #e5e5e5', fontSize: '0.75rem' }}>
                                                        Barchasi:
                                                    </TableCell>
                                                    {sessions.map(s => (
                                                        <TableCell key={s.id} align="center" sx={{ p: 0.3 }}>
                                                            <Box display="flex" gap={0.2} justifyContent="center">
                                                                <Tooltip title="Barchasi ✅">
                                                                    <IconButton size="small" onClick={() => bulkMark(s.id, 'PRESENT')} sx={{ width: 18, height: 18, color: '#16a34a', '& svg': { fontSize: 12 } }}>
                                                                        <CheckCircleIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Barchasi ❌">
                                                                    <IconButton size="small" onClick={() => bulkMark(s.id, 'ABSENT')} sx={{ width: 18, height: 18, color: '#dc2626', '& svg': { fontSize: 12 } }}>
                                                                        <CancelIcon />
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

                    {/* ═══ TAB 1: Users with Stats and History ═══ */}
                    {tabView === 1 && (
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>
                                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Foydalanuvchilar — {MONTH_NAMES[currentMonth - 1]}
                            </Typography>
                            {users.length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>Obunachi foydalanuvchilar yo'q.</Alert>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ '& th': { fontWeight: 700, color: '#114539' } }}>
                                                <TableCell>Foydalanuvchi</TableCell>
                                                <TableCell>Telefon</TableCell>
                                                <TableCell>Obuna</TableCell>
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
                                                const stats = getUserStats(user.id)
                                                return (
                                                    <TableRow key={user.id} sx={{
                                                        '&:hover': { bgcolor: 'rgba(17,69,57,0.03)' },
                                                        ...(user.isExpired && { bgcolor: '#fef2f2', '& td': { borderBottom: '2px solid #ef4444' } }),
                                                    }}>
                                                        <TableCell>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Avatar sx={{ width: 28, height: 28, bgcolor: user.isExpired ? '#ef4444' : '#114539', fontSize: '0.75rem' }}>
                                                                    {(user.firstName?.[0] || '?').toUpperCase()}
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight={600}>{user.firstName} {user.lastName}</Typography>
                                                                {user.isExpired && <WarningIcon sx={{ color: '#ef4444', fontSize: 16 }} />}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell><Typography variant="caption">{user.phone || '—'}</Typography></TableCell>
                                                        <TableCell>
                                                            <Box sx={{ fontSize: '0.7rem' }}>
                                                                <span style={{ color: user.isExpired ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
                                                                    {user.subscriptionEnd ? formatDate(user.subscriptionEnd) : '∞'}
                                                                </span>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={user.isExpired ? 'Tugagan' : 'Aktiv'} size="small"
                                                                sx={{ bgcolor: user.isExpired ? '#fee2e2' : '#dcfce7', color: user.isExpired ? '#dc2626' : '#16a34a', fontWeight: 700, fontSize: '0.65rem' }} />
                                                        </TableCell>
                                                        <TableCell align="center"><Chip label={stats.present} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700 }} /></TableCell>
                                                        <TableCell align="center"><Chip label={stats.absent} size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} /></TableCell>
                                                        <TableCell align="center"><Chip label={stats.late} size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700 }} /></TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <LinearProgress variant="determinate" value={stats.pct} sx={{
                                                                    flex: 1, height: 8, borderRadius: 4, bgcolor: '#f0f0f0',
                                                                    '& .MuiLinearProgress-bar': { bgcolor: stats.pct >= 80 ? '#16a34a' : stats.pct >= 50 ? '#d97706' : '#dc2626', borderRadius: 4 },
                                                                }} />
                                                                <Typography variant="caption" fontWeight={800} sx={{ minWidth: 30 }}>{stats.pct}%</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Tarixni ko'rish">
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

            {/* ═══ Schedule Dialog ═══ */}
            <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#114539', fontWeight: 700 }}>⚙️ Kurs jadvalini sozlash</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                        Hafta kunlarini kiriting (masalan: <strong>Du/Chor/Juma</strong> yoki <strong>Пн/Ср/Пт</strong>). Keyin "Oylik jadval yaratish" tugmasini bossangiz, tizim avtomatik ravishda shu kunlar uchun mashg'ulotlar yaratadi.
                    </Alert>
                    <TextField
                        label="Jadval kunlari"
                        value={scheduleInput}
                        onChange={e => setScheduleInput(e.target.value)}
                        fullWidth
                        sx={{ mb: 2, mt: 1 }}
                        placeholder="Du/Chor/Juma"
                        helperText="Masalan: Du/Se/Chor/Pay/Juma yoki Пн/Ср/Пт"
                    />
                    <TextField
                        label="Vaqti"
                        value={timesInput}
                        onChange={e => setTimesInput(e.target.value)}
                        fullWidth
                        placeholder="10:00-11:00"
                        helperText="Mashg'ulot vaqti"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScheduleDialog(false)}>Bekor qilish</Button>
                    <Button variant="contained" onClick={saveSchedule} disabled={saving}
                        sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' } }}>
                        {saving ? <CircularProgress size={20} /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══ Add Session Dialog ═══ */}
            <Dialog open={sessionDialog} onClose={() => setSessionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#114539', fontWeight: 700 }}>📅 Yangi mashg'ulot kuni</DialogTitle>
                <DialogContent>
                    <TextField type="date" label="Sana" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
                        fullWidth sx={{ mt: 1, mb: 2 }} InputLabelProps={{ shrink: true }} />
                    <TextField label="Sarlavha (ixtiyoriy)" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)}
                        fullWidth placeholder="Masalan: Dars #5" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSessionDialog(false)}>Bekor qilish</Button>
                    <Button variant="contained" onClick={createSession} disabled={!sessionDate || saving}
                        sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' } }}>
                        {saving ? <CircularProgress size={20} /> : 'Yaratish'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══ Per-User History Dialog ═══ */}
            <Dialog open={!!historyUserId} onClose={() => setHistoryUserId(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ color: '#114539', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> {historyUser?.firstName} {historyUser?.lastName} — {MONTH_NAMES[currentMonth - 1]} davomat
                </DialogTitle>
                <DialogContent>
                    {historyStats && (
                        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                            {[
                                { label: 'Keldi', value: historyStats.present, color: '#16a34a', bg: '#dcfce7' },
                                { label: 'Kelmadi', value: historyStats.absent, color: '#dc2626', bg: '#fee2e2' },
                                { label: 'Kechikdi', value: historyStats.late, color: '#d97706', bg: '#fef3c7' },
                                { label: 'Foiz', value: `${historyStats.pct}%`, color: historyStats.pct >= 80 ? '#16a34a' : '#dc2626', bg: historyStats.pct >= 80 ? '#dcfce7' : '#fee2e2' },
                            ].map(s => (
                                <Paper key={s.label} sx={{ p: 2, borderRadius: 2, bgcolor: s.bg, minWidth: 80, textAlign: 'center', flex: '1 1 auto' }}>
                                    <Typography variant="h5" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                                    <Typography variant="caption" fontWeight={600} sx={{ color: s.color }}>{s.label}</Typography>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    {/* Visual timeline */}
                    <Box display="flex" gap={0.5} flexWrap="wrap" p={2} bgcolor="#f8faf8" borderRadius={2} mb={3}>
                        {historyData.map((d, i) => {
                            const cfg = statusConfig[d.status]
                            return (
                                <Tooltip key={i} title={`${new Date(d.date).toLocaleDateString('uz-UZ')} — ${cfg?.label || 'Belgilanmagan'}`}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: 1,
                                        bgcolor: cfg?.bg || '#f5f5f5', border: `2px solid ${cfg?.color || '#e0e0e0'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', cursor: 'pointer',
                                        '&:hover': { transform: 'scale(1.15)' }, transition: 'transform 0.15s',
                                    }}>
                                        {cfg?.icon || '⬜'}
                                    </Box>
                                </Tooltip>
                            )
                        })}
                    </Box>

                    {/* Detailed table */}
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
                                            <TableCell>{new Date(d.date).toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</TableCell>
                                            <TableCell>{d.title || '—'}</TableCell>
                                            <TableCell align="center">
                                                <Chip label={cfg?.label || '⬜ Belgilanmagan'} size="small"
                                                    sx={{ bgcolor: `${cfg?.color}15` || '#f5f5f5', color: cfg?.color || '#888', fontWeight: 700 }} />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Subscription info */}
                    {historyUser && (
                        <Box mt={3} p={2} bgcolor={historyUser.isExpired ? '#fef2f2' : '#f0fdf4'} borderRadius={2}
                            border={`1px solid ${historyUser.isExpired ? '#fca5a5' : '#bbf7d0'}`}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: historyUser.isExpired ? '#dc2626' : '#16a34a' }}>
                                {historyUser.isExpired ? '⚠️ Obuna tugagan' : '✅ Obuna faol'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Boshlanish: <strong>{formatDate(historyUser.subscriptionStart)}</strong> →
                                Tugash: <strong>{historyUser.subscriptionEnd ? formatDate(historyUser.subscriptionEnd) : '∞'}</strong>
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
