"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Avatar, TextField, IconButton,
    Chip, CircularProgress, Divider, Badge, InputAdornment, Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

/**
 * Telegram-like Course Chat Admin Panel
 * 1. Course list with latest message previews
 * 2. Click into course → full chat thread with admin reply
 */

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
        <Box p={3} maxWidth={800} mx="auto">
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
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Auto-refresh every 5s
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
            setMessages(data.messages || []);
        } catch { }
        setLoading(false);
    };

    const handleSend = async () => {
        if (!newMessage.trim() && !attachmentUrl) return;
        setSending(true);
        try {
            const res = await fetch('/api/admin/chats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, message: newMessage.trim() || '📎 Fayl', attachmentUrl }),
            });
            if (res.ok) {
                setNewMessage('');
                setAttachmentUrl(null);
                fetchMessages();
            }
        } catch { }
        setSending(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const resUrl = await fetch('/api/admin/videos/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, contentType: file.type || 'application/octet-stream' }),
            });
            if (!resUrl.ok) throw new Error('Upload URL failed');
            const { url, publicUrl } = await resUrl.json();

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', url, true);
                xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error('Upload failed'));
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(file);
            });

            setAttachmentUrl(publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
        }
        setUploading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Group messages by date
    const groupedByDate: { date: string; msgs: ChatMsg[] }[] = [];
    messages.forEach((msg) => {
        const date = formatDate(msg.createdAt);
        const last = groupedByDate[groupedByDate.length - 1];
        if (last && last.date === date) {
            last.msgs.push(msg);
        } else {
            groupedByDate.push({ date, msgs: [msg] });
        }
    });

    return (
        <Box display="flex" flexDirection="column" height="calc(100vh - 100px)" maxWidth={800} mx="auto">
            {/* Header */}
            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '14px 14px 0 0', bgcolor: '#114539', color: '#fff' }}>
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
                                                    sx={{ width: 28, height: 28, bgcolor: '#114539', fontSize: '0.7rem' }}
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
                                                    <Typography variant="caption" sx={{ color: '#0a8069', fontWeight: 700, display: 'block', mb: 0.3 }}>
                                                        {userName}
                                                    </Typography>
                                                )}
                                                {msg.attachmentUrl && (
                                                    <Box mb={1}>
                                                        {msg.attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                            <img src={msg.attachmentUrl} alt="" style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 200 }} />
                                                        ) : msg.attachmentUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                                            <video src={msg.attachmentUrl} controls style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 200 }} />
                                                        ) : (
                                                            <Chip
                                                                icon={<AttachFileIcon />}
                                                                label="Fayl"
                                                                size="small"
                                                                component="a"
                                                                href={msg.attachmentUrl}
                                                                target="_blank"
                                                                clickable
                                                                sx={{ borderColor: '#114539', color: '#114539' }}
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
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
                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>{attachmentUrl.split('/').pop()}</Typography>
                    <IconButton size="small" onClick={() => setAttachmentUrl(null)} color="error">✕</IconButton>
                </Box>
            )}

            {/* Input */}
            <Paper sx={{ p: 1.5, borderRadius: '0 0 14px 14px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton component="label" disabled={uploading} sx={{ color: '#114539' }}>
                    {uploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
                    <input type="file" hidden onChange={handleFileUpload} accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />
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
