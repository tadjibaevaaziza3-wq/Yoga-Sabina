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

// ── Lesson Dialog (Create/Edit) ──
const LessonDialog = ({ open, onClose, onSave, lesson }: any) => {
    const [title, setTitle] = useState(lesson?.title || '');
    const [titleRu, setTitleRu] = useState(lesson?.titleRu || '');
    const [description, setDescription] = useState(lesson?.description || '');
    const [isFree, setIsFree] = useState(lesson?.isFree || false);

    useEffect(() => {
        setTitle(lesson?.title || '');
        setTitleRu(lesson?.titleRu || '');
        setDescription(lesson?.description || '');
        setIsFree(lesson?.isFree || false);
    }, [lesson]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: '#114539' }}>
                {lesson ? "Darsni tahrirlash" : "Yangi dars/video qo'shish"}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <MuiTextField
                        label="Dars nomi (UZ)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                    />
                    <MuiTextField
                        label="Dars nomi (RU)"
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
                        rows={3}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                            type="checkbox"
                            checked={isFree}
                            onChange={(e) => setIsFree(e.target.checked)}
                            id="lesson-free"
                        />
                        <label htmlFor="lesson-free" style={{ fontSize: 14, fontWeight: 600 }}>
                            Bepul dars (hamma ko'rishi mumkin)
                        </label>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Bekor qilish</Button>
                <Button
                    onClick={() => onSave({ title, titleRu, description, isFree })}
                    variant="contained"
                    disabled={!title.trim()}
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
