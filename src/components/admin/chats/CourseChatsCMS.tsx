"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Avatar, TextField, IconButton,
    Chip, CircularProgress, Divider, Badge, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableRow,
    Alert, Snackbar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonIcon from '@mui/icons-material/Person';
import LockResetIcon from '@mui/icons-material/LockReset';

interface CoursePreview {
    id: string;
    title: string;
    coverImage: string | null;
    totalMessages: number;
    lastMessage: {
        message: string;
        createdAt: string;
        senderRole: string;
        user: { firstName: string | null; lastName: string | null };
    } | null;
}

interface ChatMsg {
    id: string;
    message: string;
    senderRole: string;
    attachmentUrl: string | null;
    createdAt: string;
    user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        telegramUsername: string | null;
        telegramPhotoUrl: string | null;
    };
}

interface UserProfile {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
    telegramId: string | null;
    telegramUsername: string | null;
    role: string;
    region: string;
    language: string;
    createdAt: string;
    subscriptions: { course: { title: string }; status: string; endsAt: string }[];
    purchases: { course: { title: string }; status: string; amount: number }[];
}

// ── Main Component ──
export const CourseChatsAdmin = () => {
    const [courses, setCourses] = useState<CoursePreview[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/chats?action=courses');
            const data = await res.json();
            setCourses(Array.isArray(data) ? data : []);
        } catch { setCourses([]); }
        setLoading(false);
    };

    if (selectedCourse) {
        return (
            <ChatThread
                courseId={selectedCourse}
                courseTitle={selectedTitle}
                onBack={() => { setSelectedCourse(null); fetchCourses(); }}
            />
        );
    }

    return (
        <Box p={3} maxWidth={1200} mx="auto">
            <Typography variant="h5" sx={{ color: '#114539', fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatBubbleOutlineIcon /> Kurs chatlari
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : courses.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                    <Typography color="text.secondary">Hali chatlar yo'q</Typography>
                </Paper>
            ) : (
                <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(17,69,57,0.08)' }}>
                    {courses.map((course, i) => (
                        <Box key={course.id}>
                            <Box
                                onClick={() => { setSelectedCourse(course.id); setSelectedTitle(course.title); }}
                                sx={{
                                    p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
                                    '&:hover': { bgcolor: 'rgba(17,69,57,0.03)' },
                                    transition: 'background 0.15s',
                                }}
                            >
                                <Avatar
                                    src={course.coverImage || undefined}
                                    sx={{ width: 50, height: 50, bgcolor: '#114539', fontWeight: 700 }}
                                >
                                    {course.title[0]}
                                </Avatar>
                                <Box flex={1} minWidth={0}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography sx={{ fontWeight: 700, color: '#114539', fontSize: '0.95rem' }}>
                                            {course.title}
                                        </Typography>
                                        {course.lastMessage && (
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(course.lastMessage.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.3}>
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '80%' }}>
                                            {course.lastMessage ? (
                                                <>
                                                    {course.lastMessage.senderRole === 'ADMIN' && (
                                                        <span style={{ color: '#0a8069', fontWeight: 600 }}>Siz: </span>
                                                    )}
                                                    {course.lastMessage.message.substring(0, 60)}
                                                    {course.lastMessage.message.length > 60 ? '...' : ''}
                                                </>
                                            ) : 'Xabar yo\'q'}
                                        </Typography>
                                        <Badge
                                            badgeContent={course.totalMessages}
                                            color="primary"
                                            sx={{ '& .MuiBadge-badge': { bgcolor: '#114539', fontSize: '0.7rem' } }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            {i < courses.length - 1 && <Divider sx={{ ml: 9 }} />}
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
};

// ── Chat Thread ──
const ChatThread = ({ courseId, courseTitle, onBack }: { courseId: string; courseTitle: string; onBack: () => void }) => {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // User profile dialog
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, [courseId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/admin/chats?action=messages&courseId=${courseId}`);
            const data = await res.json();
            setMessages(Array.isArray(data.messages) ? data.messages : (Array.isArray(data) ? data : []));
        } catch { }
        setLoading(false);
    };

    const handleSend = async () => {
        if (!newMessage.trim() && !attachmentUrl) return;
        setSending(true);
        try {
            await fetch('/api/admin/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, message: newMessage || '📎', attachmentUrl }),
            });
            setNewMessage('');
            setAttachmentUrl(null);
            setAttachmentName(null);
            fetchMessages();
        } catch { }
        setSending(false);
    };

    // SECURE file upload — converts to base64 data URL, NOT GCS
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: "Fayl juda katta! Maksimal hajm: 5MB", severity: 'error' });
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/chats/upload', { method: 'POST', body: formData });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Upload failed');
            }
            const { dataUrl, fileName } = await res.json();
            setAttachmentUrl(dataUrl);
            setAttachmentName(fileName);
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Yuklash xatosi', severity: 'error' });
        }
        setUploading(false);
        // Reset file input
        e.target.value = '';
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Open user profile
    const openUserProfile = async (userId: string) => {
        setProfileOpen(true);
        setProfileLoading(true);
        setProfileData(null);
        try {
            const res = await fetch(`/api/admin/users/${userId}/profile`);
            if (res.ok) {
                const data = await res.json();
                setProfileData(data);
            }
        } catch { }
        setProfileLoading(false);
    };

    // Reset user password
    const resetPassword = async () => {
        if (!profileData) return;
        if (!confirm(`${profileData.firstName || 'Foydalanuvchi'} uchun parolni yangilamoqchimisiz? Yangi parol Telegram orqali yuboriladi.`)) return;
        setResetLoading(true);
        try {
            const res = await fetch('/api/admin/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profileData.id }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.telegramSent) {
                    setSnackbar({ open: true, message: '✅ Yangi parol Telegram orqali yuborildi!', severity: 'success' });
                } else if (data.newPassword) {
                    setSnackbar({ open: true, message: `⚠️ Telegram yuborilmadi. Yangi parol: ${data.newPassword}`, severity: 'success' });
                } else {
                    setSnackbar({ open: true, message: '⚠️ Parol yangilandi, lekin foydalanuvchida Telegram bog\'lanmagan', severity: 'error' });
                }
            } else {
                setSnackbar({ open: true, message: 'Xatolik yuz berdi', severity: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: 'Xatolik yuz berdi', severity: 'error' });
        }
        setResetLoading(false);
    };

    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // Group messages by date
    const groupedByDate = messages.reduce<{ date: string; msgs: ChatMsg[] }[]>((groups, msg) => {
        const date = formatDate(msg.createdAt);
        const last = groups[groups.length - 1];
        if (last && last.date === date) {
            last.msgs.push(msg);
        } else {
            groups.push({ date, msgs: [msg] });
        }
        return groups;
    }, []);

    // Render attachment inline (for data: URLs or legacy GCS URLs)
    const renderAttachment = (url: string) => {
        const isImage = url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isVideo = url.startsWith('data:video/') || url.match(/\.(mp4|webm|mov)$/i);
        const isAudio = url.startsWith('data:audio/') || url.match(/\.(mp3|ogg|wav)$/i);

        if (isImage) return <img src={url} alt="" style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 200 }} />;
        if (isVideo) return <video src={url} controls style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 200 }} />;
        if (isAudio) return <audio src={url} controls style={{ width: '100%' }} />;
        return (
            <Chip
                icon={<AttachFileIcon />}
                label="Fayl"
                size="small"
                sx={{ borderColor: '#114539', color: '#114539' }}
                variant="outlined"
            />
        );
    };

    return (
        <Box display="flex" flexDirection="column" height="calc(100vh - 64px)" maxWidth={1200} mx="auto">
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                    bgcolor: '#114539', color: '#fff', borderRadius: '14px 14px 0 0',
                }}
            >
                <IconButton onClick={onBack} sx={{ color: '#fff' }}><ArrowBackIcon /></IconButton>
                <Avatar sx={{ bgcolor: '#0a8069', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700 }}>{courseTitle[0]}</Avatar>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{courseTitle}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{messages.length} xabar</Typography>
                </Box>
            </Paper>

            {/* Messages */}
            <Box
                flex={1}
                overflow="auto"
                sx={{
                    bgcolor: '#e8f5e9',
                    backgroundImage: 'radial-gradient(circle, rgba(17,69,57,0.03) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    p: 2,
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                ) : messages.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary">Hali xabarlar yo'q</Typography>
                    </Box>
                ) : (
                    groupedByDate.map((group) => (
                        <Box key={group.date}>
                            <Box display="flex" justifyContent="center" my={2}>
                                <Chip label={group.date} size="small" sx={{ bgcolor: 'rgba(17,69,57,0.12)', color: '#114539', fontWeight: 600, fontSize: '0.7rem' }} />
                            </Box>
                            {group.msgs.map((msg) => {
                                const isAdmin = msg.senderRole === 'ADMIN';
                                const userName = [msg.user.firstName, msg.user.lastName].filter(Boolean).join(' ') || msg.user.telegramUsername || 'Foydalanuvchi';
                                return (
                                    <Box key={msg.id} display="flex" justifyContent={isAdmin ? 'flex-end' : 'flex-start'} mb={1}>
                                        <Box sx={{ display: 'flex', gap: 0.5, maxWidth: '70%', alignItems: 'flex-end' }}>
                                            {!isAdmin && (
                                                <Avatar
                                                    src={msg.user.telegramPhotoUrl || undefined}
                                                    sx={{
                                                        width: 28, height: 28, bgcolor: '#114539', fontSize: '0.7rem',
                                                        cursor: 'pointer', '&:hover': { ring: 2, boxShadow: '0 0 0 2px #0a8069' },
                                                    }}
                                                    onClick={() => openUserProfile(msg.user.id)}
                                                >
                                                    {userName[0]}
                                                </Avatar>
                                            )}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 1.5, borderRadius: isAdmin ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                                                    bgcolor: isAdmin ? '#dcf8c6' : '#fff',
                                                    border: `1px solid ${isAdmin ? 'rgba(17,69,57,0.1)' : 'rgba(0,0,0,0.06)'}`,
                                                    minWidth: 80,
                                                }}
                                            >
                                                {!isAdmin && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#0a8069', fontWeight: 700, display: 'block', mb: 0.3,
                                                            cursor: 'pointer', '&:hover': { textDecoration: 'underline' },
                                                        }}
                                                        onClick={() => openUserProfile(msg.user.id)}
                                                    >
                                                        {userName}
                                                    </Typography>
                                                )}
                                                {msg.attachmentUrl && (
                                                    <Box mb={1}>{renderAttachment(msg.attachmentUrl)}</Box>
                                                )}
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>
                                                    {msg.message}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', float: 'right', mt: 0.3, ml: 1, fontSize: '0.65rem' }}>
                                                    {isAdmin && '✓✓ '}
                                                    {formatTime(msg.createdAt)}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    ))
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Attachment preview */}
            {attachmentUrl && (
                <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon sx={{ color: '#114539' }} />
                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>{attachmentName || 'Fayl'}</Typography>
                    <IconButton size="small" onClick={() => { setAttachmentUrl(null); setAttachmentName(null); }} color="error">✕</IconButton>
                </Box>
            )}

            {/* Input */}
            <Paper sx={{ p: 1.5, borderRadius: '0 0 14px 14px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton component="label" disabled={uploading} sx={{ color: '#114539' }}>
                    {uploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
                    <input type="file" hidden onChange={handleFileUpload} accept="image/*,video/*,audio/*,.pdf" />
                </IconButton>
                <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Xabar yozing..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f9fafb' },
                    }}
                />
                <IconButton
                    onClick={handleSend}
                    disabled={sending || (!newMessage.trim() && !attachmentUrl)}
                    sx={{ bgcolor: '#114539', color: '#fff', '&:hover': { bgcolor: '#0a2e26' }, '&.Mui-disabled': { bgcolor: '#ccc' }, width: 40, height: 40 }}
                >
                    {sending ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
                </IconButton>
            </Paper>

            {/* User Profile Dialog */}
            <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#114539', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> Foydalanuvchi ma'lumotlari
                </DialogTitle>
                <DialogContent>
                    {profileLoading ? (
                        <Box textAlign="center" py={3}><CircularProgress sx={{ color: '#114539' }} /></Box>
                    ) : profileData ? (
                        <Box>
                            <Table size="small">
                                <TableBody>
                                    <TableRow><TableCell sx={{ fontWeight: 700, color: '#114539', width: 140 }}>Ism</TableCell><TableCell>{profileData.firstName} {profileData.lastName}</TableCell></TableRow>
                                    <TableRow><TableCell sx={{ fontWeight: 700, color: '#114539' }}>Telefon</TableCell><TableCell>{profileData.phone || '—'}</TableCell></TableRow>
                                    <TableRow><TableCell sx={{ fontWeight: 700, color: '#114539' }}>Email</TableCell><TableCell>{profileData.email || '—'}</TableCell></TableRow>
                                    <TableRow><TableCell sx={{ fontWeight: 700, color: '#114539' }}>Telegram</TableCell><TableCell>{profileData.telegramUsername ? `@${profileData.telegramUsername}` : profileData.telegramId || '—'}</TableCell></TableRow>
                                    <TableRow><TableCell sx={{ fontWeight: 700, color: '#114539' }}>Rol</TableCell><TableCell>{profileData.role}</TableCell></TableRow>
                                    <TableRow><TableCell sx={{ fontWeight: 700, color: '#114539' }}>Ro'yxatdan o'tgan</TableCell><TableCell>{new Date(profileData.createdAt).toLocaleDateString('uz-UZ')}</TableCell></TableRow>
                                </TableBody>
                            </Table>

                            {profileData.subscriptions?.length > 0 && (
                                <Box mt={2}>
                                    <Typography variant="subtitle2" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>📚 Obunalar</Typography>
                                    {profileData.subscriptions.map((sub, i) => (
                                        <Chip
                                            key={i}
                                            label={`${sub.course.title} — ${sub.status}`}
                                            size="small"
                                            sx={{ mr: 0.5, mb: 0.5, bgcolor: sub.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', fontWeight: 600, fontSize: '0.7rem' }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {profileData.purchases?.length > 0 && (
                                <Box mt={2}>
                                    <Typography variant="subtitle2" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>💳 Xaridlar</Typography>
                                    {profileData.purchases.map((p, i) => (
                                        <Chip
                                            key={i}
                                            label={`${p.course.title} — ${p.status}`}
                                            size="small"
                                            sx={{ mr: 0.5, mb: 0.5, bgcolor: p.status === 'APPROVED' || p.status === 'PAID' ? '#dcfce7' : '#fef3c7', fontWeight: 600, fontSize: '0.7rem' }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Alert severity="error">Ma'lumotlarni yuklashda xatolik</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {profileData && (
                        <Button
                            startIcon={resetLoading ? <CircularProgress size={16} /> : <LockResetIcon />}
                            onClick={resetPassword}
                            disabled={resetLoading}
                            variant="outlined"
                            color="warning"
                            sx={{ mr: 'auto', fontWeight: 700 }}
                        >
                            Parolni yangilash
                        </Button>
                    )}
                    <Button onClick={() => setProfileOpen(false)} sx={{ fontWeight: 700 }}>Yopish</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// React Admin resource export
export const CourseChatList = () => <CourseChatsAdmin />;
export const CourseChatShow = () => <CourseChatsAdmin />;

export default {
    list: CourseChatList,
    show: CourseChatShow,
    icon: ChatBubbleOutlineIcon,
    options: { label: 'Kurs chatlari' },
};
