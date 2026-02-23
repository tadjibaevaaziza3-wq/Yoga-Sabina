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

// ── Filtered Lesson List for a Course ──
const CourseLessons = ({ courseId, courseTitle, onBack }: { courseId: string; courseTitle: string; onBack: () => void }) => {
    const lessonFilters = [
        <SearchInput source="q" alwaysOn key="search" />,
        <SelectInput source="isFree" label="Turi" choices={[
            { id: 'true', name: 'Bepul' },
            { id: 'false', name: 'Pullik' },
        ]} key="isFree" />,
    ];

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2} px={3} pt={3}>
                <IconButton onClick={onBack} sx={{ color: '#114539' }}><ArrowBackIcon /></IconButton>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 800 }}>{courseTitle}</Typography>
                <Chip label="Darslar" size="small" sx={{ bgcolor: 'rgba(17,69,57,0.06)', color: '#114539', fontWeight: 600 }} />
            </Box>
            <List
                resource="lessons"
                filter={{ courseId }}
                filters={lessonFilters}
                sort={{ field: 'order', order: 'ASC' }}
                sx={{
                    '& .RaList-main': {
                        backgroundColor: 'background.paper',
                        borderRadius: '14px',
                        padding: '24px',
                        boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
                    }
                }}
            >
                <Datagrid rowClick="show" bulkActionButtons={false}>
                    <NumberField source="order" label="#" />
                    <TextField source="title" label="Sarlavha" />
                    <FunctionField
                        label="Media"
                        render={(record: any) => (
                            <Box display="flex" gap={0.5} flexWrap="wrap">
                                {record?.videoUrl && <Chip label="🎥" size="small" sx={{ bgcolor: 'rgba(17,69,57,0.08)', fontWeight: 600 }} />}
                                {record?.audioUrl && <Chip label="🎵" size="small" sx={{ bgcolor: 'rgba(10,128,105,0.08)', fontWeight: 600 }} />}
                                {record?.pdfUrl && <Chip label="📄" size="small" sx={{ bgcolor: 'rgba(200,160,50,0.1)', fontWeight: 600 }} />}
                                {record?.content && <Chip label="📝" size="small" sx={{ bgcolor: 'rgba(100,100,200,0.08)', fontWeight: 600 }} />}
                                {!record?.videoUrl && !record?.audioUrl && !record?.pdfUrl && !record?.content && (
                                    <Chip label="—" size="small" variant="outlined" />
                                )}
                            </Box>
                        )}
                    />
                    <FunctionField
                        label="Turi"
                        render={(record: any) => (
                            <Chip
                                icon={record?.isFree ? <PlayCircleIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 14 }} />}
                                label={record?.isFree ? 'Bepul' : 'Pullik'}
                                size="small"
                                color={record?.isFree ? 'success' : 'default'}
                                variant="outlined"
                            />
                        )}
                    />
                    <ShowButton label="Ko'rish" />
                    <EditButton label="Tahrirlash" />
                </Datagrid>
            </List>
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
