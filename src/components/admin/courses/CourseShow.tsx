'use client';

import { useState, useEffect } from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    ImageField,
    useRecordContext,
    useDataProvider,
    useNotify,
    useRefresh,
    Button as RaButton,
    FunctionField,
} from 'react-admin';
import {
    Box,
    Typography,
    Divider,
    Paper,
    Chip,
    IconButton,
    Collapse,
    TextField as MuiTextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    LinearProgress,
} from '@mui/material';
import {
    Add,
    ExpandMore,
    ExpandLess,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PlayCircle,
    Folder,
    VideoLibrary,
    DragIndicator,
} from '@mui/icons-material';

// ── Module Card with Lessons inside ──
const ModuleCard = ({ module, onEdit, onDelete, onAddLesson, onEditLesson, onDeleteLesson }: any) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <Paper
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(17, 69, 57, 0.1)',
                mb: 2,
            }}
        >
            {/* Module Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    py: 2,
                    bgcolor: 'rgba(17, 69, 57, 0.04)',
                    cursor: 'pointer',
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Folder sx={{ color: '#0a8069', mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#114539' }}>
                        {module.title}
                    </Typography>
                    {module.description && (
                        <Typography variant="caption" sx={{ color: '#114539', opacity: 0.6 }}>
                            {module.description}
                        </Typography>
                    )}
                </Box>
                <Chip
                    label={`${module.lessons?.length || 0} dars`}
                    size="small"
                    sx={{ mr: 1, bgcolor: '#e8f5e9', color: '#114539', fontWeight: 600 }}
                />
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(module); }}>
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(module.id); }} sx={{ color: '#d32f2f' }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
                {expanded ? <ExpandLess /> : <ExpandMore />}
            </Box>

            {/* Lessons inside this module */}
            <Collapse in={expanded}>
                <Box sx={{ px: 2, pb: 2 }}>
                    {module.lessons && module.lessons.length > 0 ? (
                        module.lessons
                            .sort((a: any, b: any) => a.order - b.order)
                            .map((lesson: any, idx: number) => (
                                <Box
                                    key={lesson.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: 'rgba(17, 69, 57, 0.03)' },
                                        borderBottom: idx < module.lessons.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                                    }}
                                >
                                    <PlayCircle sx={{ color: '#0a8069', mr: 2, fontSize: 20 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#114539' }}>
                                            {lesson.order}. {lesson.title}
                                        </Typography>
                                        {lesson.duration && (
                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                {Math.floor(lesson.duration / 60)} min
                                            </Typography>
                                        )}
                                    </Box>
                                    {lesson.isFree && (
                                        <Chip label="Bepul" size="small" color="success" variant="outlined" sx={{ mr: 1 }} />
                                    )}
                                    <IconButton size="small" onClick={() => onEditLesson(lesson)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onDeleteLesson(lesson.id)} sx={{ color: '#d32f2f' }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))
                    ) : (
                        <Box sx={{ py: 3, textAlign: 'center', color: '#999' }}>
                            <VideoLibrary sx={{ fontSize: 32, mb: 1, opacity: 0.4 }} />
                            <Typography variant="body2">Hali darslar qo'shilmagan</Typography>
                        </Box>
                    )}

                    {/* Add lesson button */}
                    <Box sx={{ mt: 1, px: 1 }}>
                        <Button
                            startIcon={<Add />}
                            size="small"
                            onClick={() => onAddLesson(module.id)}
                            sx={{ color: '#0a8069', textTransform: 'none', fontWeight: 600 }}
                        >
                            Video/dars qo'shish
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

// ── Module Dialog (Create/Edit) ──
const ModuleDialog = ({ open, onClose, onSave, module }: any) => {
    const [title, setTitle] = useState(module?.title || '');
    const [titleRu, setTitleRu] = useState(module?.titleRu || '');
    const [description, setDescription] = useState(module?.description || '');

    useEffect(() => {
        setTitle(module?.title || '');
        setTitleRu(module?.titleRu || '');
        setDescription(module?.description || '');
    }, [module]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: '#114539' }}>
                {module ? "Modulni tahrirlash" : "Yangi modul yaratish"}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <MuiTextField
                        label="Modul nomi (UZ)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                    />
                    <MuiTextField
                        label="Modul nomi (RU)"
                        value={titleRu}
                        onChange={(e) => setTitleRu(e.target.value)}
                        fullWidth
                    />
                    <MuiTextField
                        label="Tavsif"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Bekor qilish</Button>
                <Button
                    onClick={() => onSave({ title, titleRu, description })}
                    variant="contained"
                    disabled={!title.trim()}
                    sx={{ bgcolor: '#0a8069', '&:hover': { bgcolor: '#087a63' } }}
                >
                    {module ? "Saqlash" : "Yaratish"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Lesson Dialog (Create/Edit) — FULL FEATURED ──
const LessonDialog = ({ open, onClose, onSave, lesson }: any) => {
    const [activeTab, setActiveTab] = useState(0);
    const [form, setForm] = useState({
        title: '', titleRu: '', description: '', descriptionRu: '',
        duration: 0, isFree: false, videoUrl: '', audioUrl: '', pdfUrl: '',
        thumbnailUrl: '', searchKeywords: '', content: '',
    });
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        setForm({
            title: lesson?.title || '', titleRu: lesson?.titleRu || '',
            description: lesson?.description || '', descriptionRu: lesson?.descriptionRu || '',
            duration: lesson?.duration || 0, isFree: lesson?.isFree || false,
            videoUrl: lesson?.videoUrl || '', audioUrl: lesson?.audioUrl || '',
            pdfUrl: lesson?.pdfUrl || '', thumbnailUrl: lesson?.thumbnailUrl || '',
            searchKeywords: lesson?.searchKeywords || '', content: lesson?.content || '',
        });
        setActiveTab(0);
    }, [lesson, open]);

    const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    // GCS upload helper
    const handleUpload = async (file: File, field: string, contentType?: string) => {
        setUploading(prev => ({ ...prev, [field]: true }));
        setUploadProgress(prev => ({ ...prev, [field]: 0 }));
        try {
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const res = await fetch('/api/admin/videos/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, contentType: contentType || file.type || 'application/octet-stream' }),
            });
            if (!res.ok) throw new Error('Upload URL xatosi');
            const { url, publicUrl } = await res.json();

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', url, true);
                xhr.setRequestHeader('Content-Type', contentType || file.type || 'application/octet-stream');
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) setUploadProgress(prev => ({ ...prev, [field]: Math.round((e.loaded / e.total) * 100) }));
                };
                xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(file);
            });

            updateField(field, publicUrl);
        } catch (err: any) {
            console.error(`Upload ${field} error:`, err);
            alert(`Yuklash xatosi: ${err.message}`);
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
            setUploadProgress(prev => ({ ...prev, [field]: 0 }));
        }
    };

    // Auto-translate UZ → RU
    const handleTranslate = async () => {
        if (!form.title && !form.description) return;
        setTranslating(true);
        try {
            // Translate title
            if (form.title && !form.titleRu) {
                const res = await fetch('/api/admin/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: form.title, from: 'uz', to: 'ru' }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.translated) updateField('titleRu', data.translated);
                }
            }
            // Translate description
            if (form.description && !form.descriptionRu) {
                const res = await fetch('/api/admin/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: form.description, from: 'uz', to: 'ru' }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.translated) updateField('descriptionRu', data.translated);
                }
            }
        } catch (err) {
            console.error('Translation error:', err);
        } finally {
            setTranslating(false);
        }
    };

    const tabs = ['Asosiy', 'Media', 'Fayllar'];
    const fileShortName = (url: string) => url ? decodeURIComponent(url.split('/').pop() || '').slice(0, 40) : '';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: '#114539', borderBottom: '1px solid rgba(17,69,57,0.08)', pb: 1 }}>
                {lesson ? "Darsni tahrirlash" : "Yangi dars/video qo'shish"}
            </DialogTitle>

            {/* Tabs */}
            <Box sx={{ display: 'flex', gap: 0.5, px: 3, pt: 2, borderBottom: '1px solid rgba(17,69,57,0.06)' }}>
                {tabs.map((tab, i) => (
                    <Button
                        key={tab}
                        onClick={() => setActiveTab(i)}
                        sx={{
                            fontWeight: activeTab === i ? 700 : 500,
                            color: activeTab === i ? '#114539' : '#999',
                            borderBottom: activeTab === i ? '2px solid #0a8069' : '2px solid transparent',
                            borderRadius: 0, px: 2, pb: 1, textTransform: 'none', fontSize: '0.85rem',
                        }}
                    >
                        {tab}
                    </Button>
                ))}
            </Box>

            <DialogContent sx={{ minHeight: 400 }}>
                {/* Tab 0: Basic */}
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        {/* Titles */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <MuiTextField label="Dars nomi (UZ) *" value={form.title} onChange={e => updateField('title', e.target.value)} fullWidth required />
                            <MuiTextField label="Дарс номи (RU)" value={form.titleRu} onChange={e => updateField('titleRu', e.target.value)} fullWidth />
                        </Box>
                        {/* Auto-translate button */}
                        <Button
                            onClick={handleTranslate}
                            disabled={translating || (!form.title && !form.description)}
                            size="small"
                            sx={{ alignSelf: 'flex-start', color: '#0a8069', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                            {translating ? '🔄 Tarjima qilinmoqda...' : '🌐 UZ → RU avtomatik tarjima'}
                        </Button>
                        {/* Descriptions */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <MuiTextField label="Tavsif (UZ)" value={form.description} onChange={e => updateField('description', e.target.value)} fullWidth multiline rows={3} />
                            <MuiTextField label="Описание (RU)" value={form.descriptionRu} onChange={e => updateField('descriptionRu', e.target.value)} fullWidth multiline rows={3} />
                        </Box>
                        {/* Duration + Order + Free */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <MuiTextField label="Davomiylik (soniya)" type="number" value={form.duration || ''} onChange={e => updateField('duration', parseInt(e.target.value) || 0)} sx={{ width: 180 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
                                <input type="checkbox" id="lesson-free-dlg" checked={form.isFree} onChange={e => updateField('isFree', e.target.checked)} />
                                <label htmlFor="lesson-free-dlg" style={{ fontSize: 14, fontWeight: 600, color: '#114539' }}>Bepul dars</label>
                            </Box>
                        </Box>
                        {/* Search keywords */}
                        <MuiTextField
                            label="Qidiruv kalit so'zlari"
                            value={form.searchKeywords}
                            onChange={e => updateField('searchKeywords', e.target.value)}
                            fullWidth
                            size="small"
                            helperText="Vergul bilan ajrating: yoga, nafas olish, meditatsiya"
                        />
                    </Box>
                )}

                {/* Tab 1: Media */}
                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        {/* Video */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#114539', mb: 1 }}>🎥 Video</Typography>
                            {form.videoUrl ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid rgba(17,69,57,0.15)', borderRadius: 2, bgcolor: 'rgba(16,163,127,0.04)' }}>
                                    <PlayCircle sx={{ color: '#0a8069' }} />
                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem', color: '#114539', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        ✅ {fileShortName(form.videoUrl)}
                                    </Typography>
                                    <IconButton size="small" onClick={() => updateField('videoUrl', '')} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            ) : (
                                <Box>
                                    <Button variant="outlined" component="label" disabled={uploading.videoUrl}
                                        startIcon={uploading.videoUrl ? <LinearProgress sx={{ width: 20 }} /> : <VideoLibrary />}
                                        sx={{ borderColor: '#114539', color: '#114539', textTransform: 'none', fontWeight: 600 }}>
                                        {uploading.videoUrl ? `Yuklanmoqda ${uploadProgress.videoUrl || 0}%` : 'Video yuklash'}
                                        <input type="file" hidden accept="video/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'videoUrl', f.type); }} />
                                    </Button>
                                    {uploading.videoUrl && <LinearProgress variant="determinate" value={uploadProgress.videoUrl || 0} sx={{ mt: 1, height: 4, borderRadius: 2 }} />}
                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#999' }}>MP4, WebM — bulutga yuklash</Typography>
                                </Box>
                            )}
                        </Box>

                        <Divider />

                        {/* Audio */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#114539', mb: 1 }}>🎵 Audio</Typography>
                            {form.audioUrl ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid rgba(100,100,200,0.2)', borderRadius: 2, bgcolor: 'rgba(100,100,200,0.04)' }}>
                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem', color: '#114539' }}>✅ {fileShortName(form.audioUrl)}</Typography>
                                    <IconButton size="small" onClick={() => updateField('audioUrl', '')} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            ) : (
                                <Box>
                                    <Button variant="outlined" component="label" disabled={uploading.audioUrl}
                                        sx={{ borderColor: '#6366f1', color: '#6366f1', textTransform: 'none', fontWeight: 600 }}>
                                        {uploading.audioUrl ? `Yuklanmoqda ${uploadProgress.audioUrl || 0}%` : 'Audio yuklash'}
                                        <input type="file" hidden accept="audio/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'audioUrl', f.type); }} />
                                    </Button>
                                    {uploading.audioUrl && <LinearProgress variant="determinate" value={uploadProgress.audioUrl || 0} sx={{ mt: 1, height: 4, borderRadius: 2 }} />}
                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#999' }}>MP3, WAV — meditatsiya, musiqa</Typography>
                                </Box>
                            )}
                        </Box>

                        <Divider />

                        {/* Thumbnail */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#114539', mb: 1 }}>📷 Muqova rasmi</Typography>
                            {form.thumbnailUrl ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box component="img" src={form.thumbnailUrl} sx={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 2, border: '1px solid #ddd' }} />
                                    <IconButton size="small" onClick={() => updateField('thumbnailUrl', '')} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            ) : (
                                <Box>
                                    <Button variant="outlined" component="label" disabled={uploading.thumbnailUrl}
                                        sx={{ borderColor: '#c89632', color: '#c89632', textTransform: 'none', fontWeight: 600 }}>
                                        {uploading.thumbnailUrl ? `Yuklanmoqda ${uploadProgress.thumbnailUrl || 0}%` : 'Rasm yuklash'}
                                        <input type="file" hidden accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'thumbnailUrl', f.type); }} />
                                    </Button>
                                    {uploading.thumbnailUrl && <LinearProgress variant="determinate" value={uploadProgress.thumbnailUrl || 0} sx={{ mt: 1, height: 4, borderRadius: 2 }} />}
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Tab 2: Files & Content */}
                {activeTab === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        {/* PDF / Documents */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#114539', mb: 1 }}>📄 Hujjatlar (PDF / PPT)</Typography>
                            {form.pdfUrl ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid rgba(200,150,50,0.2)', borderRadius: 2, bgcolor: 'rgba(200,150,50,0.04)' }}>
                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem', color: '#114539' }}>✅ {fileShortName(form.pdfUrl)}</Typography>
                                    <IconButton size="small" onClick={() => updateField('pdfUrl', '')} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            ) : (
                                <Box>
                                    <Button variant="outlined" component="label" disabled={uploading.pdfUrl}
                                        sx={{ borderColor: '#c89632', color: '#c89632', textTransform: 'none', fontWeight: 600 }}>
                                        {uploading.pdfUrl ? `Yuklanmoqda ${uploadProgress.pdfUrl || 0}%` : 'Fayl yuklash'}
                                        <input type="file" hidden accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'pdfUrl'); }} />
                                    </Button>
                                    {uploading.pdfUrl && <LinearProgress variant="determinate" value={uploadProgress.pdfUrl || 0} sx={{ mt: 1, height: 4, borderRadius: 2 }} />}
                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#999' }}>PDF, PPT, DOC, ZIP</Typography>
                                </Box>
                            )}
                        </Box>

                        <Divider />

                        {/* Text content */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#114539', mb: 1 }}>📝 Matnli kontent</Typography>
                            <MuiTextField
                                value={form.content}
                                onChange={e => updateField('content', e.target.value)}
                                fullWidth multiline rows={6}
                                placeholder="Dars haqida batafsil ma'lumot, ko'rsatmalar, transkriptsiya..."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, borderTop: '1px solid rgba(17,69,57,0.06)' }}>
                {/* Upload indicators */}
                {Object.values(uploading).some(Boolean) && (
                    <Typography variant="caption" sx={{ mr: 'auto', color: '#c89632', fontWeight: 600 }}>
                        ⏳ Fayl yuklanmoqda...
                    </Typography>
                )}
                <Button onClick={onClose}>Bekor qilish</Button>
                <Button
                    onClick={() => onSave(form)}
                    variant="contained"
                    disabled={!form.title.trim() || Object.values(uploading).some(Boolean)}
                    sx={{ bgcolor: '#0a8069', '&:hover': { bgcolor: '#087a63' } }}
                >
                    {lesson ? "Saqlash" : "Qo'shish"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Main CourseShow with Module Hierarchy ──
const CourseModules = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialogs
    const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<any>(null);
    const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

    // Fetch modules with lessons for this course
    const fetchModules = async () => {
        if (!record?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses/${record?.id}/modules`);
            if (res.ok) {
                const data = await res.json();
                setModules(data);
            }
        } catch (err) {
            console.error('Failed to fetch modules', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, [record?.id]);

    // Module CRUD
    const handleSaveModule = async (data: any) => {
        try {
            if (editingModule) {
                await fetch(`/api/admin/courses/${record?.id}/modules`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, id: editingModule.id }),
                });
                notify('Modul yangilandi', { type: 'success' });
            } else {
                await fetch(`/api/admin/courses/${record?.id}/modules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, order: modules.length }),
                });
                notify('Yangi modul yaratildi', { type: 'success' });
            }
            setModuleDialogOpen(false);
            setEditingModule(null);
            fetchModules();
        } catch (err) {
            notify('Xatolik yuz berdi', { type: 'error' });
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Bu modulni o'chirmoqchimisiz? Barcha darslar ham o'chiriladi.")) return;
        try {
            await fetch(`/api/admin/courses/${record?.id}/modules?moduleId=${moduleId}`, {
                method: 'DELETE',
            });
            notify("Modul o'chirildi", { type: 'success' });
            fetchModules();
        } catch (err) {
            notify('Xatolik yuz berdi', { type: 'error' });
        }
    };

    // Lesson CRUD
    const handleSaveLesson = async (data: any) => {
        try {
            if (editingLesson) {
                await fetch(`/api/admin/courses/${record?.id}/lessons`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, id: editingLesson.id }),
                });
                notify('Dars yangilandi', { type: 'success' });
            } else {
                const targetModule = modules.find(m => m.id === targetModuleId);
                const order = (targetModule?.lessons?.length || 0) + 1;
                await fetch(`/api/admin/courses/${record?.id}/lessons`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...data, moduleId: targetModuleId, order }),
                });
                notify("Yangi dars qo'shildi", { type: 'success' });
            }
            setLessonDialogOpen(false);
            setEditingLesson(null);
            setTargetModuleId(null);
            fetchModules();
        } catch (err) {
            notify('Xatolik yuz berdi', { type: 'error' });
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("Bu darsni o'chirmoqchimisiz?")) return;
        try {
            await fetch(`/api/admin/courses/${record?.id}/lessons?lessonId=${lessonId}`, {
                method: 'DELETE',
            });
            notify("Dars o'chirildi", { type: 'success' });
            fetchModules();
        } catch (err) {
            notify('Xatolik yuz berdi', { type: 'error' });
        }
    };

    if (loading) return <LinearProgress />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }}>
                    📂 Kurs modullari
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => { setEditingModule(null); setModuleDialogOpen(true); }}
                    sx={{ bgcolor: '#0a8069', '&:hover': { bgcolor: '#087a63' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                    Yangi modul
                </Button>
            </Box>

            {modules.length > 0 ? (
                modules
                    .sort((a, b) => a.order - b.order)
                    .map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            onEdit={(m: any) => { setEditingModule(m); setModuleDialogOpen(true); }}
                            onDelete={handleDeleteModule}
                            onAddLesson={(moduleId: string) => { setTargetModuleId(moduleId); setEditingLesson(null); setLessonDialogOpen(true); }}
                            onEditLesson={(lesson: any) => { setEditingLesson(lesson); setLessonDialogOpen(true); }}
                            onDeleteLesson={handleDeleteLesson}
                        />
                    ))
            ) : (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '2px dashed rgba(17, 69, 57, 0.15)' }}>
                    <Folder sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>Hali modullar yaratilmagan</Typography>
                    <Typography variant="body2" sx={{ color: '#bbb', mb: 3 }}>
                        "Yangi modul" tugmasini bosib, kurs strukturasini yarating
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => { setEditingModule(null); setModuleDialogOpen(true); }}
                        sx={{ borderColor: '#0a8069', color: '#0a8069', textTransform: 'none', fontWeight: 600 }}
                    >
                        Birinchi modulni yaratish
                    </Button>
                </Paper>
            )}

            <ModuleDialog
                open={moduleDialogOpen}
                onClose={() => { setModuleDialogOpen(false); setEditingModule(null); }}
                onSave={handleSaveModule}
                module={editingModule}
            />
            <LessonDialog
                open={lessonDialogOpen}
                onClose={() => { setLessonDialogOpen(false); setEditingLesson(null); setTargetModuleId(null); }}
                onSave={handleSaveLesson}
                lesson={editingLesson}
            />
        </Box>
    );
};

// ── Title component ──
const ShowTitle = () => {
    const record = useRecordContext();
    return <span>Kurs: {record?.title || ''}</span>;
};

// ── Main Show Page ──
export const CourseShow = () => (
    <Show title={<ShowTitle />}>
        <SimpleShowLayout sx={{ '&.RaSimpleShowLayout-root': { padding: 0, backgroundColor: 'transparent', boxShadow: 'none' } }}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '4fr 8fr' }} gap={4} width="100%">
                {/* Left: Course details */}
                <Box>
                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', height: '100%' }}>
                        <Box mb={3} display="flex" justifyContent="center">
                            <ImageField source="coverImage" sx={{ '& img': { width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: '12px' } }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 800, color: '#114539' }} gutterBottom>
                            <TextField source="title" />
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                            <FunctionField render={(record: any) => <Chip label={record?.type === 'ONLINE' ? 'Onlayn' : 'Oflayn'} color="primary" size="small" variant="outlined" />} />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <NumberField source="price" label="Narx" options={{ style: 'currency', currency: 'UZS' }} />
                        <Box mt={2}>
                            <TextField source="description" label="Tavsif" sx={{ whiteSpace: 'pre-wrap' }} />
                        </Box>
                    </Paper>
                </Box>

                {/* Right: Modules with lessons */}
                <Box>
                    <CourseModules />
                </Box>
            </Box>
        </SimpleShowLayout>
    </Show>
);
