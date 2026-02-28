"use client";

import { useState, useEffect } from 'react';
import {
    List, Datagrid, TextField, NumberField, ShowButton, EditButton,
    ReferenceField, ReferenceInput, SelectInput, SearchInput,
    FunctionField, Create, SimpleForm, TextInput, BooleanInput, NumberInput,
    useGetList, useNotify
} from 'react-admin';
import {
    Box, Typography, Paper, Chip, Avatar, IconButton,
    CircularProgress, Divider, TextField as MuiTextField, InputAdornment,
    Card, CardContent, CardActionArea, Badge, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import LockIcon from '@mui/icons-material/Lock';
import FolderIcon from '@mui/icons-material/Folder';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Cache for signed URLs to avoid re-fetching
const signedUrlCache: Record<string, string> = {};

/** Fetches a signed GCS URL and shows the video's first frame as a thumbnail */
const VideoThumbnail = ({ videoUrl, thumbnailUrl }: { videoUrl?: string; thumbnailUrl?: string }) => {
    const [src, setSrc] = useState<string | null>(thumbnailUrl || null);
    const [isVideo, setIsVideo] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (thumbnailUrl) { setSrc(thumbnailUrl); setIsVideo(false); return; }
        if (!videoUrl) return;

        // Check cache
        if (signedUrlCache[videoUrl]) {
            setSrc(signedUrlCache[videoUrl]);
            setIsVideo(true);
            return;
        }

        let cancelled = false;
        fetch(`/api/admin/video-thumbnail?url=${encodeURIComponent(videoUrl)}`)
            .then(r => r.json())
            .then(data => {
                if (!cancelled && data.signedUrl) {
                    signedUrlCache[videoUrl] = data.signedUrl;
                    setSrc(data.signedUrl);
                    setIsVideo(true);
                }
            })
            .catch(() => { if (!cancelled) setFailed(true); });

        return () => { cancelled = true; };
    }, [videoUrl, thumbnailUrl]);

    if (failed || !src) {
        return (
            <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: videoUrl ? 'rgba(17,69,57,0.08)' : 'rgba(17,69,57,0.04)', borderRadius: 1.5, flexShrink: 0 }}>
                {videoUrl ? <PlayCircleIcon sx={{ fontSize: 20, color: '#114539', opacity: 0.4 }} /> : <MenuBookIcon sx={{ fontSize: 18, color: '#114539', opacity: 0.25 }} />}
            </Avatar>
        );
    }

    if (isVideo) {
        return (
            <Box sx={{ width: 44, height: 44, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(17,69,57,0.12)', bgcolor: '#000' }}>
                <video
                    src={src + '#t=1'}
                    muted
                    preload="metadata"
                    onError={() => setFailed(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </Box>
        );
    }

    return (
        <Avatar src={src} variant="rounded" sx={{ width: 44, height: 44, borderRadius: 1.5, flexShrink: 0, border: '1px solid rgba(17,69,57,0.1)' }}>
            <PlayCircleIcon sx={{ fontSize: 20, color: '#114539', opacity: 0.4 }} />
        </Avatar>
    );
};

/**
 * Course-first Lesson Management
 * 1. Course cards view (with lesson counts, free/paid breakdown)
 * 2. Click course → see its lessons in a filtered list
 * 3. Global search across all lessons
 */

// ── Course Selector View ──
const CourseSelector = ({ onSelect }: { onSelect: (courseId: string, title: string) => void }) => {
    const { data: courses, isPending } = useGetList('courses', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'title', order: 'ASC' },
    });
    const { data: allLessons } = useGetList('lessons', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'order', order: 'ASC' },
    });
    const [search, setSearch] = useState('');

    // Count lessons per course
    const lessonCounts: Record<string, { total: number; free: number; video: number }> = {};
    allLessons?.forEach((l: any) => {
        if (!lessonCounts[l.courseId]) lessonCounts[l.courseId] = { total: 0, free: 0, video: 0 };
        lessonCounts[l.courseId].total++;
        if (l.isFree) lessonCounts[l.courseId].free++;
        if (l.videoUrl) lessonCounts[l.courseId].video++;
    });

    const filtered = courses?.filter((c: any) =>
        c.title.toLowerCase().includes(search.toLowerCase())
    ) || [];

    if (isPending) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Box p={3} maxWidth={1000} mx="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MenuBookIcon /> Kurslar → Darslar
                </Typography>
            </Box>

            <MuiTextField
                fullWidth
                placeholder="Kursni qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#114539' }} /></InputAdornment>,
                    sx: { borderRadius: 3, bgcolor: '#f9fafb' },
                }}
            />

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2}>
                {filtered.map((course: any) => {
                    const counts = lessonCounts[course.id] || { total: 0, free: 0, video: 0 };
                    return (
                        <Card key={course.id} sx={{ borderRadius: 3, border: '1px solid rgba(17,69,57,0.08)', '&:hover': { boxShadow: '0 4px 12px rgba(17,69,57,0.1)' }, transition: 'box-shadow 0.2s' }}>
                            <CardActionArea onClick={() => onSelect(course.id, course.title)} sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" gap={1.5} alignItems="flex-start">
                                        <Avatar
                                            src={course.coverImage || undefined}
                                            sx={{ width: 48, height: 48, bgcolor: '#114539', fontWeight: 700, borderRadius: 2 }}
                                            variant="rounded"
                                        >
                                            {course.title?.[0]}
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography sx={{ fontWeight: 700, color: '#114539', fontSize: '0.95rem', mb: 0.5, lineHeight: 1.3 }}>
                                                {course.title}
                                            </Typography>
                                            <Box display="flex" gap={0.5} flexWrap="wrap">
                                                <Chip label={`${counts.total} dars`} size="small" sx={{ bgcolor: 'rgba(17,69,57,0.06)', color: '#114539', fontWeight: 600, fontSize: '0.7rem' }} />
                                                {counts.free > 0 && <Chip label={`${counts.free} bepul`} size="small" sx={{ bgcolor: 'rgba(16,163,127,0.1)', color: '#0a8069', fontWeight: 600, fontSize: '0.7rem' }} />}
                                                {counts.video > 0 && <Chip label={`🎥 ${counts.video}`} size="small" sx={{ bgcolor: 'rgba(100,100,200,0.08)', fontSize: '0.7rem' }} />}
                                            </Box>
                                            <Chip
                                                label={course.isActive ? 'Faol' : 'Nofaol'}
                                                size="small"
                                                sx={{ mt: 1, bgcolor: course.isActive ? 'rgba(16,163,127,0.08)' : 'rgba(200,50,50,0.08)', color: course.isActive ? '#0a8069' : '#dc2626', fontWeight: 600, fontSize: '0.65rem' }}
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    );
                })}
            </Box>

            {filtered.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, mt: 2 }}>
                    <Typography color="text.secondary">Kurs topilmadi</Typography>
                </Paper>
            )}
        </Box>
    );
};

// ── Hierarchical Lesson List: Course → Module → Lesson ──
const CourseLessons = ({ courseId, courseTitle, onBack }: { courseId: string; courseTitle: string; onBack: () => void }) => {
    const { data: modules, isPending: modulesLoading } = useGetList('modules', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'order', order: 'ASC' },
        filter: { courseId },
    });
    const { data: allLessons, isPending: lessonsLoading } = useGetList('lessons', {
        pagination: { page: 1, perPage: 500 },
        sort: { field: 'order', order: 'ASC' },
        filter: { courseId },
    });
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [search, setSearch] = useState('');
    const notify = useNotify();

    // Auto-expand all modules on first load
    useEffect(() => {
        if (modules && Object.keys(expandedModules).length === 0) {
            const expanded: Record<string, boolean> = {};
            modules.forEach((m: any) => { expanded[m.id] = true; });
            expanded['__ungrouped__'] = true;
            setExpandedModules(expanded);
        }
    }, [modules]);

    const toggleModule = (id: string) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isPending = modulesLoading || lessonsLoading;
    if (isPending) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

    const lessons = allLessons || [];
    const moduleList = modules || [];

    // Group lessons by module
    const lessonsByModule: Record<string, any[]> = {};
    const ungroupedLessons: any[] = [];
    lessons.forEach((lesson: any) => {
        const filtered = search
            ? lesson.title?.toLowerCase().includes(search.toLowerCase()) ||
            lesson.titleRu?.toLowerCase().includes(search.toLowerCase())
            : true;
        if (!filtered) return;
        if (lesson.moduleId) {
            if (!lessonsByModule[lesson.moduleId]) lessonsByModule[lesson.moduleId] = [];
            lessonsByModule[lesson.moduleId].push(lesson);
        } else {
            ungroupedLessons.push(lesson);
        }
    });

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '—';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderLesson = (lesson: any, index: number) => (
        <Box
            key={lesson.id}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                borderBottom: '1px solid rgba(17,69,57,0.06)',
                '&:hover': { bgcolor: 'rgba(17,69,57,0.02)' },
                transition: 'background 0.15s',
            }}
        >
            {/* Order number */}
            <Typography sx={{ width: 28, textAlign: 'center', fontWeight: 700, color: '#114539', fontSize: '0.85rem', opacity: 0.5 }}>
                {lesson.order}
            </Typography>

            {/* Thumbnail */}
            <VideoThumbnail videoUrl={lesson.videoUrl} thumbnailUrl={lesson.thumbnailUrl} />

            {/* Lesson info */}
            <Box flex={1} minWidth={0}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#114539', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lesson.title}
                </Typography>
                {lesson.titleRu && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#114539', opacity: 0.5 }}>
                        {lesson.titleRu}
                    </Typography>
                )}
            </Box>

            {/* Media chips */}
            <Box display="flex" gap={0.5} flexWrap="nowrap" flexShrink={0}>
                {lesson.videoUrl && <Chip label="🎥 Video" size="small" sx={{ bgcolor: 'rgba(17,69,57,0.08)', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />}
                {lesson.audioUrl && <Chip label="🎵 Audio" size="small" sx={{ bgcolor: 'rgba(10,128,105,0.08)', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />}
                {lesson.pdfUrl && <Chip label="📄 PDF" size="small" sx={{ bgcolor: 'rgba(200,160,50,0.1)', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />}
                {!lesson.videoUrl && !lesson.audioUrl && !lesson.pdfUrl && (
                    <Chip label="⚠ No media" size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: '0.7rem', height: 24, color: '#dc2626' }} />
                )}
            </Box>

            {/* Duration */}
            <Typography sx={{ fontSize: '0.75rem', color: '#114539', opacity: 0.5, width: 50, textAlign: 'center' }}>
                {formatDuration(lesson.duration)}
            </Typography>

            {/* Free/Paid */}
            <Chip
                icon={lesson.isFree ? <PlayCircleIcon sx={{ fontSize: 14 }} /> : <LockIcon sx={{ fontSize: 12 }} />}
                label={lesson.isFree ? 'Bepul' : 'Pullik'}
                size="small"
                color={lesson.isFree ? 'success' : 'default'}
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.68rem', height: 24 }}
            />

            {/* Actions */}
            <Box display="flex" gap={0.5} flexShrink={0}>
                <ShowButton resource="lessons" record={lesson} label="" sx={{ minWidth: 32 }} />
                <EditButton resource="lessons" record={lesson} label="" sx={{ minWidth: 32 }} />
            </Box>
        </Box>
    );

    return (
        <Box maxWidth={1100} mx="auto">
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={2} px={3} pt={3}>
                <IconButton onClick={onBack} sx={{ color: '#114539' }}><ArrowBackIcon /></IconButton>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 800, flex: 1 }}>{courseTitle}</Typography>
                <Chip label={`${lessons.length} dars`} size="small" sx={{ bgcolor: 'rgba(17,69,57,0.06)', color: '#114539', fontWeight: 600 }} />
                {moduleList.length > 0 && (
                    <Chip label={`${moduleList.length} modul`} size="small" sx={{ bgcolor: 'rgba(10,128,105,0.08)', color: '#0a8069', fontWeight: 600 }} />
                )}
            </Box>

            {/* Search */}
            <Box px={3} mb={2}>
                <MuiTextField
                    fullWidth
                    placeholder="Dars qidirish..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#114539' }} /></InputAdornment>,
                        sx: { borderRadius: 3, bgcolor: '#f9fafb' },
                    }}
                />
            </Box>

            {/* Modules with lessons */}
            <Box px={3} pb={3}>
                {moduleList.map((mod: any) => {
                    const modLessons = lessonsByModule[mod.id] || [];
                    const isExpanded = expandedModules[mod.id];
                    const hasVideo = modLessons.some((l: any) => l.videoUrl);

                    return (
                        <Paper
                            key={mod.id}
                            sx={{
                                mb: 2,
                                borderRadius: 3,
                                border: '1px solid rgba(17,69,57,0.1)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Module header */}
                            <Box
                                onClick={() => toggleModule(mod.id)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2.5,
                                    py: 2,
                                    cursor: 'pointer',
                                    bgcolor: 'rgba(17,69,57,0.03)',
                                    '&:hover': { bgcolor: 'rgba(17,69,57,0.06)' },
                                    transition: 'background 0.15s',
                                }}
                            >
                                <FolderIcon sx={{ color: '#114539', fontSize: 22 }} />
                                <Box flex={1}>
                                    <Typography sx={{ fontWeight: 700, color: '#114539', fontSize: '0.95rem' }}>
                                        {mod.title}
                                    </Typography>
                                    {mod.titleRu && (
                                        <Typography sx={{ fontSize: '0.75rem', color: '#114539', opacity: 0.5 }}>
                                            {mod.titleRu}
                                        </Typography>
                                    )}
                                </Box>
                                <Chip label={`${modLessons.length} dars`} size="small" sx={{ bgcolor: 'rgba(17,69,57,0.06)', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                                {hasVideo && <VideoLibraryIcon sx={{ fontSize: 18, color: '#0a8069', opacity: 0.6 }} />}
                                {isExpanded ? <ExpandLessIcon sx={{ color: '#114539' }} /> : <ExpandMoreIcon sx={{ color: '#114539' }} />}
                            </Box>

                            {/* Lessons inside module */}
                            {isExpanded && (
                                <Box>
                                    {modLessons.length > 0 ? (
                                        modLessons.map((lesson: any, i: number) => renderLesson(lesson, i))
                                    ) : (
                                        <Box px={3} py={2}>
                                            <Typography sx={{ fontSize: '0.85rem', color: '#114539', opacity: 0.4, fontStyle: 'italic' }}>
                                                Bu modulda hali dars yo'q
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    );
                })}

                {/* Ungrouped lessons (no module) */}
                {ungroupedLessons.length > 0 && (
                    <Paper
                        sx={{
                            mb: 2,
                            borderRadius: 3,
                            border: '1px solid rgba(200,150,50,0.2)',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            onClick={() => toggleModule('__ungrouped__')}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                px: 2.5,
                                py: 2,
                                cursor: 'pointer',
                                bgcolor: 'rgba(200,150,50,0.05)',
                                '&:hover': { bgcolor: 'rgba(200,150,50,0.08)' },
                                transition: 'background 0.15s',
                            }}
                        >
                            <FolderIcon sx={{ color: '#c89632', fontSize: 22 }} />
                            <Typography sx={{ fontWeight: 700, color: '#114539', fontSize: '0.95rem', flex: 1 }}>
                                Modulsiz darslar
                            </Typography>
                            <Chip label={`${ungroupedLessons.length} dars`} size="small" sx={{ bgcolor: 'rgba(200,150,50,0.1)', fontWeight: 600, fontSize: '0.7rem', height: 24, color: '#c89632' }} />
                            {expandedModules['__ungrouped__'] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                        {expandedModules['__ungrouped__'] && (
                            <Box>
                                {ungroupedLessons.map((lesson: any, i: number) => renderLesson(lesson, i))}
                            </Box>
                        )}
                    </Paper>
                )}

                {moduleList.length === 0 && ungroupedLessons.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                        <Typography color="text.secondary">Bu kursda hali darslar yo'q</Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

// ── Main Lesson List with Course Grouping ──
export const LessonList = () => {
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedTitle, setSelectedTitle] = useState('');

    if (selectedCourse) {
        return (
            <CourseLessons
                courseId={selectedCourse}
                courseTitle={selectedTitle}
                onBack={() => setSelectedCourse(null)}
            />
        );
    }

    return (
        <CourseSelector
            onSelect={(id, title) => { setSelectedCourse(id); setSelectedTitle(title); }}
        />
    );
};
