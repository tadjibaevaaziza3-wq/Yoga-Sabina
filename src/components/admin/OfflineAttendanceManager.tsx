'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Box, Typography, Paper, Button, IconButton, Chip, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, FormControl, InputLabel, Tooltip, Avatar, TextField,
    Skeleton, Divider,
} from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SaveIcon from '@mui/icons-material/Save'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PersonIcon from '@mui/icons-material/Person'
import WarningIcon from '@mui/icons-material/Warning'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

// ─── Types ───
interface Course { id: string; title: string; schedule?: string; times?: string; location?: string }
interface SessionData { id: string; date: string; timeSlot: string | null; attendances: { userId: string; status: string }[] }
interface UserData { id: string; firstName: string | null; lastName: string | null; phone: string | null; telegramUsername?: string | null; isExpired: boolean; subscriptionEnd: string | null }
interface TimeSlotGroup { timeSlot: string; sessions: SessionData[]; users: UserData[] }

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
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState('')
    const [loading, setLoading] = useState(false)
    const [savingSchedule, setSavingSchedule] = useState(false)

    // Schedule config
    const [selectedDays, setSelectedDays] = useState<number[]>([])
    const [scheduleChanged, setScheduleChanged] = useState(false)

    // Time slots
    const [timeSlots, setTimeSlots] = useState<string[]>([])
    const [newTimeSlot, setNewTimeSlot] = useState('')

    // Time-slot groups (data from API)
    const [groups, setGroups] = useState<Record<string, TimeSlotGroup>>({})

    // Month navigation
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth() + 1)
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    // Cell saving state
    const [savingCell, setSavingCell] = useState<string | null>(null)

    const selectedCourseObj = courses.find(c => c.id === selectedCourse)

    // Load courses
    useEffect(() => {
        fetch('/api/admin/offline-attendance?action=courses')
            .then(r => r.json()).then(setCourses).catch(() => { })
    }, [])

    // Parse schedule from selected course
    useEffect(() => {
        if (!selectedCourseObj) return
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
        setScheduleChanged(false)
    }, [selectedCourseObj?.id])

    // Load davomat data (auto-generates sessions)
    const loadDavomat = useCallback(async () => {
        if (!selectedCourse) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/offline-attendance?action=davomat&courseId=${selectedCourse}&month=${monthStr}`)
            const data = await res.json()
            setGroups(data.groups || {})
            setTimeSlots(data.timeSlots || [])
        } catch { }
        setLoading(false)
    }, [selectedCourse, monthStr])

    useEffect(() => { loadDavomat() }, [loadDavomat])

    // Save schedule
    const saveSchedule = async () => {
        if (!selectedCourse) return
        setSavingSchedule(true)
        const dayNames = selectedDays
            .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
            .map(d => DAYS_OF_WEEK.find(dw => dw.key === d)?.full || '')
            .filter(Boolean)
        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update-schedule', courseId: selectedCourse, schedule: dayNames.join(', ') }),
            })
            const res = await fetch('/api/admin/offline-attendance?action=courses')
            setCourses(await res.json())
            setScheduleChanged(false)
            loadDavomat()
        } catch { }
        setSavingSchedule(false)
    }

    // Add time slot
    const addTimeSlot = async () => {
        if (!selectedCourse || !newTimeSlot) return
        await fetch('/api/admin/offline-attendance', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add-timeslot', courseId: selectedCourse, newTime: newTimeSlot }),
        })
        setNewTimeSlot('')
        // Reload courses + davomat
        const res = await fetch('/api/admin/offline-attendance?action=courses')
        setCourses(await res.json())
        loadDavomat()
    }

    // Remove time slot
    const removeTimeSlot = async (time: string) => {
        if (!confirm(`"${time}" vaqtni o'chirmoqchimisiz?`)) return
        await fetch('/api/admin/offline-attendance', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'remove-timeslot', courseId: selectedCourse, removeTime: time }),
        })
        const res = await fetch('/api/admin/offline-attendance?action=courses')
        setCourses(await res.json())
        loadDavomat()
    }

    // Mark attendance (optimistic update)
    const markAttendance = async (sessionId: string, userId: string, newStatus: string) => {
        const cellKey = `${sessionId}-${userId}`
        setSavingCell(cellKey)
        // Optimistic update
        setGroups(prev => {
            const next = { ...prev }
            Object.keys(next).forEach(tsKey => {
                next[tsKey] = {
                    ...next[tsKey],
                    sessions: next[tsKey].sessions.map(s => {
                        if (s.id !== sessionId) return s
                        const existing = s.attendances.find(a => a.userId === userId)
                        if (existing) {
                            return { ...s, attendances: s.attendances.map(a => a.userId === userId ? { ...a, status: newStatus } : a) }
                        }
                        return { ...s, attendances: [...s.attendances, { userId, status: newStatus }] }
                    }),
                }
            })
            return next
        })
        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark-attendance', sessionId, userId, status: newStatus }),
            })
        } catch { }
        setSavingCell(null)
    }

    // Bulk mark
    const bulkMark = async (sessionId: string, userIds: string[], status: string) => {
        setSavingCell(`bulk-${sessionId}`)
        setGroups(prev => {
            const next = { ...prev }
            Object.keys(next).forEach(tsKey => {
                next[tsKey] = {
                    ...next[tsKey],
                    sessions: next[tsKey].sessions.map(s => {
                        if (s.id !== sessionId) return s
                        return { ...s, attendances: userIds.map(uid => ({ userId: uid, status })) }
                    }),
                }
            })
            return next
        })
        try {
            await fetch('/api/admin/offline-attendance', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk-mark', sessionId, userIds, status }),
            })
        } catch { }
        setSavingCell(null)
    }

    const toggleDay = (key: number) => {
        setSelectedDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key])
        setScheduleChanged(true)
    }
    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

    // ─── RENDER ───
    return (
        <Box sx={{ maxWidth: 1600 }}>
            {/* ═══ STEP 1: Course Selector ═══ */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#888', fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
                    Kursni tanlang
                </Typography>
                <FormControl fullWidth size="small">
                    <InputLabel>Offline kurs</InputLabel>
                    <Select value={selectedCourse} label="Offline kurs" onChange={e => setSelectedCourse(e.target.value)} sx={{ borderRadius: 2 }}>
                        {courses.map(c => (
                            <MenuItem key={c.id} value={c.id}>📚 {c.title} {c.location && `— 📍 ${c.location}`}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {selectedCourse && (
                <>
                    {/* ═══ STEP 2: Schedule + Time Slots ═══ */}
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#888', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
                            Jadval va vaqtlar
                        </Typography>

                        {/* Days of week */}
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#555', fontSize: '0.8rem' }}>Hafta kunlari:</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                            {DAYS_OF_WEEK.map(day => {
                                const sel = selectedDays.includes(day.key)
                                return (
                                    <Button key={day.key} variant={sel ? 'contained' : 'outlined'}
                                        onClick={() => toggleDay(day.key)}
                                        sx={{
                                            minWidth: 52, height: 44, borderRadius: 2, fontWeight: 800, fontSize: '0.7rem', textTransform: 'none',
                                            ...(sel ? { bgcolor: '#114539', color: 'white', '&:hover': { bgcolor: '#0a8069' }, boxShadow: '0 2px 8px rgba(17,69,57,0.3)' }
                                                : { borderColor: '#e0e0e0', color: '#999', '&:hover': { borderColor: '#114539', color: '#114539' } }),
                                        }}
                                    >
                                        <Box><Box sx={{ fontSize: '0.75rem', lineHeight: 1 }}>{day.uz}</Box><Box sx={{ fontSize: '0.55rem', opacity: 0.5 }}>{day.ru}</Box></Box>
                                    </Button>
                                )
                            })}
                            {scheduleChanged && (
                                <Button variant="contained" startIcon={savingSchedule ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                                    onClick={saveSchedule} disabled={savingSchedule}
                                    sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' }, fontWeight: 700, borderRadius: 2, textTransform: 'none', ml: 1 }}
                                >Saqlash</Button>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Time slots */}
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#555', fontSize: '0.8rem' }}>
                            <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} /> Mashg'ulot vaqtlari:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
                            {timeSlots.filter(t => t !== 'default').map(ts => (
                                <Chip key={ts} label={`🕐 ${ts}`}
                                    onDelete={() => removeTimeSlot(ts)}
                                    sx={{ fontWeight: 700, fontSize: '0.85rem', bgcolor: '#e8f5e9', color: '#2e7d32', '& .MuiChip-deleteIcon': { color: '#c62828' } }}
                                />
                            ))}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField type="time" size="small" value={newTimeSlot}
                                    onChange={e => setNewTimeSlot(e.target.value)}
                                    sx={{ width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2, height: 36 } }}
                                    placeholder="18:00"
                                />
                                <IconButton onClick={addTimeSlot} disabled={!newTimeSlot}
                                    sx={{ bgcolor: '#114539', color: 'white', width: 36, height: 36, '&:hover': { bgcolor: '#0a8069' }, '&.Mui-disabled': { bgcolor: '#e0e0e0' } }}
                                >
                                    <AddIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Paper>

                    {/* ═══ Month Navigator ═══ */}
                    <Paper sx={{ p: 2, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={prevMonth} size="small"><NavigateBeforeIcon /></IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#114539', minWidth: 150, textAlign: 'center' }}>
                            {MONTHS[month - 1]} {year}
                        </Typography>
                        <IconButton onClick={nextMonth} size="small"><NavigateNextIcon /></IconButton>
                    </Paper>

                    {/* ═══ Loading ═══ */}
                    {loading && (
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            {[1, 2, 3].map(i => <Skeleton key={i} height={48} sx={{ borderRadius: 1 }} />)}
                        </Paper>
                    )}

                    {/* ═══ TABLES PER TIME SLOT ═══ */}
                    {!loading && Object.keys(groups).length === 0 && (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                            {selectedDays.length === 0
                                ? "Avval hafta kunlarini tanlang."
                                : timeSlots.filter(t => t !== 'default').length === 0
                                    ? "Vaqt qo'shing (masalan 10:00, 11:00)."
                                    : "Bu oy uchun obunachi yo'q."}
                        </Alert>
                    )}

                    {!loading && Object.entries(groups).map(([tsKey, group]) => (
                        <Paper key={tsKey} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                            {/* Time slot header */}
                            <Box sx={{ px: 3, py: 2, bgcolor: '#114539', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ScheduleIcon />
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    {tsKey === 'default' ? "Umumiy" : `🕐 ${tsKey}`}
                                </Typography>
                                <Chip label={`${group.users.length} talaba`} size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                                    icon={<PersonIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                                />
                                <Chip label={`${group.sessions.length} kun`} size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                                />
                            </Box>

                            {group.users.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
                                    Bu vaqt uchun obunachi yo'q.
                                </Box>
                            ) : group.sessions.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>
                                    Bu oy uchun mashg'ulotlar yo'q. Hafta kunlarini tanlang.
                                </Box>
                            ) : (
                                <TableContainer sx={{ maxHeight: 600 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{
                                                    fontWeight: 700, color: '#114539', minWidth: 180,
                                                    position: 'sticky', left: 0, bgcolor: 'white', zIndex: 3,
                                                    borderRight: '2px solid #e5e7eb',
                                                }}>Talaba</TableCell>
                                                {group.sessions.map(s => {
                                                    const d = new Date(s.date)
                                                    const isToday = d.toDateString() === new Date().toDateString()
                                                    return (
                                                        <TableCell key={s.id} align="center" sx={{
                                                            minWidth: 56, maxWidth: 56, p: '4px',
                                                            bgcolor: isToday ? '#114539' : '#fafafa',
                                                            color: isToday ? 'white' : '#114539',
                                                        }}>
                                                            <Box sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.1 }}>{d.getDate()}</Box>
                                                            <Box sx={{ fontSize: '0.55rem', fontWeight: 600, opacity: 0.6 }}>
                                                                {MONTHS[d.getMonth()].slice(0, 3)}
                                                            </Box>
                                                            <Box sx={{ fontSize: '0.5rem', opacity: 0.4 }}>{DAY_ABBR[d.getDay()]}</Box>
                                                        </TableCell>
                                                    )
                                                })}
                                                <TableCell align="center" sx={{ fontWeight: 700, color: '#114539', minWidth: 60, borderLeft: '2px solid #e5e7eb' }}>📊</TableCell>
                                            </TableRow>

                                            {/* Bulk row */}
                                            <TableRow>
                                                <TableCell sx={{ position: 'sticky', left: 0, bgcolor: '#f8faf8', zIndex: 3, borderRight: '2px solid #e5e7eb', fontSize: '0.65rem', fontWeight: 600, color: '#bbb' }}>
                                                    Barchasi:
                                                </TableCell>
                                                {group.sessions.map(s => (
                                                    <TableCell key={s.id} align="center" sx={{ bgcolor: '#f8faf8', p: '2px' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1px' }}>
                                                            <Tooltip title="Barchasi ✅"><IconButton size="small" onClick={() => bulkMark(s.id, group.users.map(u => u.id), 'PRESENT')} sx={{ width: 20, height: 20, fontSize: 12 }}>✅</IconButton></Tooltip>
                                                            <Tooltip title="Barchasi ❌"><IconButton size="small" onClick={() => bulkMark(s.id, group.users.map(u => u.id), 'ABSENT')} sx={{ width: 20, height: 20, fontSize: 12 }}>❌</IconButton></Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                ))}
                                                <TableCell sx={{ bgcolor: '#f8faf8', borderLeft: '2px solid #e5e7eb' }} />
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {group.users.map(user => {
                                                // Calculate stats
                                                let present = 0, total = group.sessions.length
                                                group.sessions.forEach(s => {
                                                    const att = s.attendances.find(a => a.userId === user.id)
                                                    if (att?.status === 'PRESENT' || att?.status === 'LATE') present++
                                                })
                                                const pct = total > 0 ? Math.round((present / total) * 100) : 0

                                                return (
                                                    <TableRow key={user.id} sx={{ '&:hover td': { bgcolor: 'rgba(17,69,57,0.02) !important' } }}>
                                                        <TableCell sx={{
                                                            position: 'sticky', left: 0, zIndex: 1,
                                                            bgcolor: user.isExpired ? '#fef2f2' : 'white',
                                                            borderRight: '2px solid #e5e7eb',
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 26, height: 26, bgcolor: user.isExpired ? '#ef4444' : '#114539', fontSize: '0.65rem', fontWeight: 800 }}>
                                                                    {(user.firstName?.[0] || '?').toUpperCase()}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2 }}>
                                                                        {user.firstName} {user.lastName}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ fontSize: '0.55rem', color: '#999' }}>
                                                                        {user.phone || '—'}
                                                                    </Typography>
                                                                </Box>
                                                                {user.isExpired && <Tooltip title="Obuna tugagan"><WarningIcon sx={{ color: '#ef4444', fontSize: 14, ml: 'auto' }} /></Tooltip>}
                                                            </Box>
                                                        </TableCell>

                                                        {group.sessions.map(s => {
                                                            const status = s.attendances.find(a => a.userId === user.id)?.status || null
                                                            const isSaving = savingCell === `${s.id}-${user.id}`
                                                            return (
                                                                <TableCell key={s.id} align="center" sx={{
                                                                    p: 0, cursor: 'pointer',
                                                                    bgcolor: status === 'PRESENT' ? '#f0fdf4' : status === 'ABSENT' ? '#fef2f2' : 'transparent',
                                                                }}>
                                                                    {isSaving ? <CircularProgress size={14} /> : (
                                                                        <Tooltip title={status === 'PRESENT' ? '✅→❌' : status === 'ABSENT' ? '❌→⬜' : '⬜→✅'}>
                                                                            <Box onClick={() => {
                                                                                const next = !status ? 'PRESENT' : status === 'PRESENT' ? 'ABSENT' : 'PRESENT'
                                                                                markAttendance(s.id, user.id, next)
                                                                            }}
                                                                                sx={{ width: '100%', minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, '&:hover': { transform: 'scale(1.2)' }, transition: 'all 0.1s', userSelect: 'none' }}
                                                                            >
                                                                                {status === 'PRESENT' ? '✅' : status === 'ABSENT' ? '❌' : '⬜'}
                                                                            </Box>
                                                                        </Tooltip>
                                                                    )}
                                                                </TableCell>
                                                            )
                                                        })}

                                                        <TableCell align="center" sx={{ borderLeft: '2px solid #e5e7eb' }}>
                                                            <Chip label={`${pct}%`} size="small" sx={{
                                                                fontWeight: 800, fontSize: '0.65rem',
                                                                bgcolor: pct >= 80 ? '#dcfce7' : pct >= 50 ? '#fef3c7' : '#fee2e2',
                                                                color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626',
                                                            }} />
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {/* Legend */}
                            <Box sx={{ px: 3, py: 1.5, bgcolor: '#f8faf8', borderTop: '1px solid #eee', display: 'flex', gap: 3 }}>
                                {[{ i: '✅', l: 'Keldi', c: '#16a34a' }, { i: '❌', l: 'Kelmadi', c: '#dc2626' }, { i: '⬜', l: 'Belgilanmagan', c: '#999' }].map(x => (
                                    <Box key={x.l} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <span style={{ fontSize: 12 }}>{x.i}</span>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: x.c }}>{x.l}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    ))}
                </>
            )}
        </Box>
    )
}
