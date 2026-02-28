"use client";

import {
    List, Datagrid, TextField, DateField, FunctionField,
    Show, SimpleShowLayout, ShowButton, EditButton,
    Edit, Create, SimpleForm, TextInput, SelectInput, BooleanInput,
    useRecordContext, useGetList, useNotify, useRefresh,
    Toolbar, SaveButton, DeleteButton
} from 'react-admin';
import {
    Box, Typography, Chip, Divider, Paper, Alert,
    Button, IconButton, Card, CardContent,
    TextField as MuiTextField, Select, MenuItem, FormControl, InputLabel,
    Switch, FormControlLabel, CircularProgress, Tab, Tabs
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// ── Labels ──
const triggerLabels: Record<string, string> = {
    REGISTERED_NO_PURCHASE: "Ro'yxatdan o'tdi, xarid qilmadi",
    VIEWED_COURSE_NO_SUB: "Ko'rdi, lekin sotib olmadi",
    INACTIVE_3_DAYS: '3 kun nofaol',
    INACTIVE_10_DAYS: '10 kun nofaol',
    SUB_EXPIRING_SOON: 'Obuna tugashiga yaqin',
    NEW_MODULE_ADDED: '📚 Yangi modul qo\'shildi (faol obunachilarga)',
    WATCHED_50_PERCENT: "50% ko'rdi",
    OPENED_TG_NO_CLICK: 'Telegram ochdi, bosmadi',
    CUSTOM: 'Maxsus',
};
const toneLabels: Record<string, string> = { soft: '🕊️ Yumshoq', motivational: '🔥 Motivatsion', strict: '⚡ Qat\'iy', friendly: '😊 Do\'stona' };
const goalLabels: Record<string, string> = { return: '🔄 Qaytarish', resubscribe: '🔑 Qayta obuna', purchase: '💳 Xarid qildirish', new_module: '📚 Yangi modul haqida xabar' };

// ── List ──
export const AutomationList = () => (
    <List sort={{ field: 'createdAt', order: 'DESC' }} sx={{ '& .RaList-main': { bgcolor: 'background.paper', borderRadius: '14px', p: 3, boxShadow: '0 1px 3px rgba(17,69,57,0.06)' } }}>
        <Datagrid rowClick="show" bulkActionButtons={false}>
            <TextField source="name" label="Nomi" />
            <FunctionField label="Trigger" render={(r: any) => <Chip label={triggerLabels[r?.conditionType] || r?.conditionType} size="small" variant="outlined" sx={{ borderColor: '#114539', color: '#114539' }} />} />
            <FunctionField label="Holat" render={(r: any) => <Chip label={r?.isActive ? 'Faol' : 'Nofaol'} size="small" sx={{ bgcolor: r?.isActive ? 'rgba(17,69,57,0.08)' : 'rgba(200,50,50,0.08)', color: r?.isActive ? '#114539' : '#dc2626', fontWeight: 600 }} />} />
            <StepCountField label="Qadamlar" />
            <DateField source="createdAt" label="Yaratilgan" />
            <ShowButton label="Ko'rish" />
            <EditButton label="Tahrirlash" />
        </Datagrid>
    </List>
);

const StepCountField = ({ label }: { label: string }) => {
    const record = useRecordContext();
    const { data } = useGetList('automationsteps', { filter: { triggerId: record?.id }, pagination: { page: 1, perPage: 100 } });
    const aiCount = data?.filter((s: any) => s.aiEnabled)?.length || 0;
    return (
        <Box display="flex" gap={0.5}>
            <Chip label={`${data?.length || 0} qadam`} size="small" sx={{ bgcolor: 'rgba(10,128,105,0.08)', color: '#0a8069' }} />
            {aiCount > 0 && <Chip label={`🤖 ${aiCount}`} size="small" sx={{ bgcolor: 'rgba(147,51,234,0.08)', color: '#9333ea' }} />}
        </Box>
    );
};

// ── Show ──
export const AutomationShow = () => (
    <Show title={<span>Avtomatizatsiya tafsilotlari</span>}>
        <SimpleShowLayout><AutomationShowContent /></SimpleShowLayout>
    </Show>
);

const AutomationShowContent = () => {
    const record = useRecordContext();
    const { data: steps } = useGetList('automationsteps', { filter: { triggerId: record?.id }, sort: { field: 'stepOrder', order: 'ASC' }, pagination: { page: 1, perPage: 100 } });
    const [stats, setStats] = useState<any>(null);
    const [firing, setFiring] = useState(false);
    const [fireResult, setFireResult] = useState<string | null>(null);

    useEffect(() => {
        if (record?.id) {
            fetch(`/api/admin/automations/stats?triggerId=${record.id}`).then(r => r.json()).then(setStats).catch(() => { });
        }
    }, [record?.id]);

    const handleFireNow = async () => {
        if (!record?.id) return;
        setFiring(true);
        setFireResult(null);
        try {
            const res = await fetch('/api/admin/automations/fire', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggerId: record.id, force: true }),
            });
            const data = await res.json();
            if (data.success) {
                setFireResult(`✅ ${data.sent} ta obunachiga yuborildi (${data.failed || 0} xatolik)`);
            } else {
                setFireResult(`❌ Xatolik: ${data.error}`);
            }
        } catch (err: any) {
            setFireResult(`❌ ${err.message}`);
        }
        setFiring(false);
    };

    if (!record) return null;

    return (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700 }} gutterBottom>{record.name}</Typography>
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip label={record.isActive ? 'Faol' : 'Nofaol'} color={record.isActive ? 'success' : 'default'} size="small" />
                    <Chip label={triggerLabels[record.conditionType] || record.conditionType} size="small" variant="outlined" />
                </Box>

                {/* 🚀 Fire Now Button */}
                {record.conditionType === 'NEW_MODULE_ADDED' && (
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            disabled={firing}
                            onClick={handleFireNow}
                            sx={{ bgcolor: '#114539', '&:hover': { bgcolor: '#0a8069' }, fontWeight: 700, borderRadius: 3 }}
                        >
                            {firing ? <><CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} /> Yuborilmoqda...</> : '🚀 Hozir yuborish'}
                        </Button>
                        {fireResult && (
                            <Alert severity={fireResult.startsWith('✅') ? 'success' : 'error'} sx={{ mt: 1, borderRadius: 2 }}>{fireResult}</Alert>
                        )}
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 600, mb: 2 }}>Qadamlar ({steps?.length || 0})</Typography>
                {steps?.map((step: any, idx: number) => (
                    <Card key={step.id} sx={{ mb: 1.5, bgcolor: 'rgba(17,69,57,0.02)', border: '1px solid rgba(17,69,57,0.08)' }}>
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" gap={1} alignItems="center">
                                    <Chip label={`#${idx + 1}`} size="small" sx={{ bgcolor: '#114539', color: '#fff', fontWeight: 700 }} />
                                    <Typography variant="body2" color="text.secondary">{step.delayDays} kundan so'ng</Typography>
                                    {step.aiEnabled && <Chip label="🤖 AI" size="small" sx={{ bgcolor: 'rgba(147,51,234,0.1)', color: '#9333ea', fontWeight: 700 }} />}
                                    <Chip label={toneLabels[step.tone] || step.tone} size="small" variant="outlined" />
                                    <Chip label={goalLabels[step.goal] || step.goal} size="small" variant="outlined" />
                                    {step.variant && <Chip label={`A/B: ${step.variant}`} size="small" variant="outlined" sx={{ borderColor: '#d97706', color: '#d97706' }} />}
                                </Box>
                            </Box>
                            {step.contentText && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', color: '#333' }}>{step.contentText.substring(0, 200)}{step.contentText.length > 200 ? '...' : ''}</Typography>}
                        </CardContent>
                    </Card>
                ))}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 600, mb: 2 }}>📊 Statistika</Typography>
                {stats ? (
                    <Box>
                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={3}>
                            <StatCard label="Yuborilgan" value={stats.totalSent} color="#16a34a" />
                            <StatCard label="Kutilmoqda" value={stats.totalPending} color="#d97706" />
                            <StatCard label="Xatolik" value={stats.totalFailed} color="#dc2626" />
                            <StatCard label="Qaytganlar" value={stats.returned} color="#0a8069" />
                            <Box gridColumn="1 / -1"><StatCard label="Konversiya" value={`${stats.conversionRate}%`} color="#114539" /></Box>
                        </Box>
                        {stats.abTest && (stats.abTest.variantA.sent > 0 || stats.abTest.variantB.sent > 0) && (
                            <>
                                <Typography variant="subtitle2" sx={{ color: '#114539', fontWeight: 600, mb: 1 }}>🔬 A/B Test</Typography>
                                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                    <StatCard label="Variant A" value={`${stats.abTest.variantA.rate}%`} color="#2563eb" />
                                    <StatCard label="Variant B" value={`${stats.abTest.variantB.rate}%`} color="#9333ea" />
                                </Box>
                            </>
                        )}
                    </Box>
                ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>Statistika yuklanmoqda...</Alert>
                )}
            </Paper>
        </Box>
    );
};

const StatCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
    <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', border: `1px solid ${color}20`, bgcolor: `${color}08` }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: '#5a6b5a', fontWeight: 600 }}>{label}</Typography>
    </Paper>
);

// ── Create / Edit ──
export const AutomationCreate = () => (<Create title={<span>Yangi avtomatizatsiya</span>} redirect="show"><AutomationForm /></Create>);
export const AutomationEdit = () => (<Edit title={<span>Avtomatizatsiyani tahrirlash</span>} redirect="show"><AutomationForm isEdit /></Edit>);

interface StepData {
    id?: string; stepOrder: number; delayDays: number; contentType: string;
    contentText: string; contentUrl: string;
    aiEnabled: boolean; basePrompt: string; tone: string; goal: string; variant: string;
}

const AutomationForm = ({ isEdit }: { isEdit?: boolean }) => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [steps, setSteps] = useState<StepData[]>([
        { stepOrder: 1, delayDays: 3, contentType: 'text', contentText: '', contentUrl: '', aiEnabled: false, basePrompt: '', tone: 'friendly', goal: 'return', variant: '' }
    ]);
    const [loadingSteps, setLoadingSteps] = useState(false);
    const [uploadingStep, setUploadingStep] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

    // Fetch courses list for dropdown
    useEffect(() => {
        fetch('/api/courses')
            .then(r => r.json())
            .then(data => {
                const list = data.courses || data;
                if (Array.isArray(list)) setCourses(list.map((c: any) => ({ id: c.id, title: c.title })));
            })
            .catch(() => { });
    }, []);

    const handleFileUpload = async (index: number, file: File) => {
        setUploadingStep(index);
        setUploadProgress(0);
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
                xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100)); };
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error('Upload failed'));
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(file);
            });

            updateStep(index, 'contentUrl', publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
        }
        setUploadingStep(null);
        setUploadProgress(0);
    };
    const [previewing, setPreviewing] = useState<number | null>(null);
    const [previewText, setPreviewText] = useState<Record<number, string>>({});

    useEffect(() => {
        if (isEdit && record?.id) {
            setLoadingSteps(true);
            fetch(`/api/admin/ra/automationsteps?filter=${encodeURIComponent(JSON.stringify({ triggerId: record.id }))}&sort=${encodeURIComponent(JSON.stringify(['stepOrder', 'ASC']))}&range=${encodeURIComponent(JSON.stringify([0, 99]))}`)
                .then(r => r.json())
                .then((data) => {
                    if (data?.length > 0) {
                        setSteps(data.map((s: any) => ({
                            id: s.id, stepOrder: s.stepOrder, delayDays: s.delayDays,
                            contentType: s.contentType || 'text', contentText: s.contentText || '', contentUrl: s.contentUrl || '',
                            aiEnabled: s.aiEnabled || false, basePrompt: s.basePrompt || '', tone: s.tone || 'friendly', goal: s.goal || 'return', variant: s.variant || '',
                        })));
                    }
                })
                .catch(() => { })
                .finally(() => setLoadingSteps(false));
        }
    }, [isEdit, record?.id]);

    const addStep = () => setSteps(prev => [...prev, { stepOrder: prev.length + 1, delayDays: 7, contentType: 'text', contentText: '', contentUrl: '', aiEnabled: false, basePrompt: '', tone: 'friendly', goal: 'return', variant: '' }]);
    const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepOrder: idx + 1 })));
    const updateStep = (i: number, field: keyof StepData, value: any) => setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
    const moveStep = (i: number, dir: 'up' | 'down') => {
        const arr = [...steps]; const j = dir === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setSteps(arr.map((s, idx) => ({ ...s, stepOrder: idx + 1 })));
    };

    const handlePreview = async (index: number) => {
        const step = steps[index];
        setPreviewing(index);
        try {
            const res = await fetch('/api/admin/automations/ai-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tone: step.tone, goal: step.goal, basePrompt: step.basePrompt || null }),
            });
            const data = await res.json();
            setPreviewText(prev => ({ ...prev, [index]: data.message || 'Xatolik' }));
        } catch { setPreviewText(prev => ({ ...prev, [index]: 'Xatolik yuz berdi' })); }
        finally { setPreviewing(null); }
    };

    const handleSave = async (values: any) => {
        try {
            let triggerId = record?.id;
            const isNewModule = values.conditionType === 'NEW_MODULE_ADDED';
            const name = values.name || triggerLabels[values.conditionType] || `Avtomatizatsiya ${new Date().toLocaleDateString()}`;
            const triggerData = { name, conditionType: values.conditionType, courseId: values.courseId || null, isActive: values.isActive ?? false, channel: 'TELEGRAM', messageTemplate: { text: '', buttons: [] }, delayMinutes: 0 };

            if (isEdit && triggerId) {
                await fetch(`/api/admin/ra/triggers/${triggerId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(triggerData) });
            } else {
                const res = await fetch('/api/admin/ra/triggers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(triggerData) });
                if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Trigger saqlashda xatolik'); }
                const t = await res.json(); triggerId = t.id;
            }

            if (isEdit) {
                const old = await fetch(`/api/admin/ra/automationsteps?filter=${encodeURIComponent(JSON.stringify({ triggerId }))}&range=[0,99]&sort=["id","ASC"]`).then(r => r.json());
                for (const s of old) await fetch(`/api/admin/ra/automationsteps/${s.id}`, { method: 'DELETE' });
            }

            for (const step of steps) {
                // Force 0 delay for NEW_MODULE_ADDED — immediate delivery
                const stepDelay = isNewModule ? 0 : step.delayDays;
                await fetch('/api/admin/ra/automationsteps', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        triggerId, stepOrder: step.stepOrder, delayDays: stepDelay,
                        contentType: step.contentType, contentText: step.contentText || null, contentUrl: step.contentUrl || null,
                        aiEnabled: step.aiEnabled, basePrompt: step.basePrompt || null, tone: step.tone, goal: step.goal, variant: step.variant || null,
                    }),
                });
            }

            // For NEW_MODULE_ADDED: fire immediately after save
            if (isNewModule && values.isActive && triggerId) {
                notify('Saqlandi! Xabarlar yuborilmoqda...', { type: 'info' });
                const fireRes = await fetch('/api/admin/automations/fire', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ triggerId }),
                });
                const fireData = await fireRes.json();
                if (fireData.success) {
                    notify(`✅ ${fireData.sent} ta obunachiga xabar yuborildi!`, { type: 'success' });
                } else {
                    notify(`⚠️ Saqlandi, lekin yuborishda xatolik: ${fireData.error}`, { type: 'warning' });
                }
            } else {
                notify('Saqlandi!', { type: 'success' });
            }

            refresh();
            if (!isEdit && triggerId) window.location.hash = `#/automations/${triggerId}/show`;
        } catch (err: any) { notify(`Xatolik: ${err.message}`, { type: 'error' }); }
    };

    return (
        <SimpleForm
            toolbar={<Toolbar><SaveButton label="Saqlash" alwaysEnable />{isEdit && <DeleteButton label="O'chirish" sx={{ ml: 'auto' }} />}</Toolbar>}
            onSubmit={handleSave}
            sx={{ maxWidth: 960, '& .MuiPaper-root': { bgcolor: 'background.paper', borderRadius: '14px', p: 4, boxShadow: '0 1px 3px rgba(17,69,57,0.06)' } }}
        >
            <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>Asosiy ma'lumotlar</Typography>
            <Divider sx={{ mb: 3 }} />
            <TextInput source="name" label="Nomi" fullWidth />
            <SelectInput source="conditionType" label="Trigger turi" fullWidth choices={Object.entries(triggerLabels).map(([id, name]) => ({ id, name }))} />
            <SelectInput
                source="courseId"
                label="📚 Kurs tanlang"
                fullWidth
                emptyText="Barchasi (kurs tanlanmagan)"
                choices={courses.map(c => ({ id: c.id, name: c.title }))}
                helperText="Avtomatizatsiya qaysi kursga tegishli?"
            />
            <BooleanInput source="isActive" label="Faol" defaultValue={false} />

            <Box mt={4} width="100%">
                <Typography variant="h5" sx={{ color: '#114539', fontWeight: 700, mb: 1 }}>🤖 Xabar zanjiri</Typography>
                <Divider sx={{ mb: 3 }} />
                {loadingSteps && <Alert severity="info" sx={{ mb: 2 }}>Yuklanmoqda...</Alert>}

                {steps.map((step, index) => (
                    <Card key={index} sx={{ mb: 2, border: '1px solid rgba(17,69,57,0.12)', borderRadius: 3, overflow: 'visible' }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box display="flex" gap={1} alignItems="center">
                                    <Chip label={`Qadam #${index + 1}`} sx={{ bgcolor: '#114539', color: '#fff', fontWeight: 700 }} />
                                    {step.aiEnabled && <Chip label="🤖 AI" size="small" sx={{ bgcolor: 'rgba(147,51,234,0.1)', color: '#9333ea', fontWeight: 700 }} />}
                                </Box>
                                <Box display="flex" gap={0.5}>
                                    <IconButton size="small" onClick={() => moveStep(index, 'up')} disabled={index === 0}>↑</IconButton>
                                    <IconButton size="small" onClick={() => moveStep(index, 'down')} disabled={index === steps.length - 1}>↓</IconButton>
                                    <IconButton size="small" color="error" onClick={() => removeStep(index)} disabled={steps.length <= 1}>✕</IconButton>
                                </Box>
                            </Box>

                            {/* Row 1: Delay + Content Type + AI Toggle */}
                            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                                <MuiTextField type="number" label="Kutish (kun)" value={step.delayDays} onChange={e => updateStep(index, 'delayDays', parseInt(e.target.value) || 1)} size="small" sx={{ width: 130 }} inputProps={{ min: 1 }} />
                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>Kontent turi</InputLabel>
                                    <Select value={step.contentType} label="Kontent turi" onChange={e => updateStep(index, 'contentType', e.target.value)}>
                                        <MenuItem value="text">📝 Matn</MenuItem>
                                        <MenuItem value="video">🎥 Video</MenuItem>
                                        <MenuItem value="audio">🎵 Audio</MenuItem>
                                        <MenuItem value="image">📷 Rasm</MenuItem>
                                        <MenuItem value="file">📄 Fayl</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControlLabel
                                    control={<Switch checked={step.aiEnabled} onChange={e => updateStep(index, 'aiEnabled', e.target.checked)} color="secondary" />}
                                    label="🤖 AI Personalizatsiya"
                                    sx={{ '& .MuiTypography-root': { fontWeight: 600, fontSize: '0.875rem' } }}
                                />
                            </Box>

                            {/* Row 2: Tone + Goal + Variant */}
                            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>Ohang</InputLabel>
                                    <Select value={step.tone} label="Ohang" onChange={e => updateStep(index, 'tone', e.target.value)}>
                                        {Object.entries(toneLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                    <InputLabel>Maqsad</InputLabel>
                                    <Select value={step.goal} label="Maqsad" onChange={e => updateStep(index, 'goal', e.target.value)}>
                                        {Object.entries(goalLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <InputLabel>A/B Test</InputLabel>
                                    <Select value={step.variant} label="A/B Test" onChange={e => updateStep(index, 'variant', e.target.value)}>
                                        <MenuItem value="">Yo'q</MenuItem>
                                        <MenuItem value="A">Variant A</MenuItem>
                                        <MenuItem value="B">Variant B</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Content */}
                            <MuiTextField label={step.aiEnabled ? "AI Prompt (ixtiyoriy)" : "Xabar matni"} multiline rows={3} fullWidth value={step.aiEnabled ? step.basePrompt : step.contentText}
                                onChange={e => updateStep(index, step.aiEnabled ? 'basePrompt' : 'contentText', e.target.value)} size="small" sx={{ mb: 1.5 }}
                                helperText={step.aiEnabled ? "Bo'sh qoldirilsa standart prompt ishlatiladi" : "HTML formatini qo'llab-quvvatlaydi"} />

                            {(step.contentType !== 'text') && (
                                <Box sx={{ mb: 1.5 }}>
                                    {step.contentUrl ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid rgba(17,69,57,0.15)', borderRadius: 2, bgcolor: 'rgba(17,69,57,0.02)' }}>
                                            {step.contentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img src={step.contentUrl} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                                            ) : step.contentUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                                <Box sx={{ width: 60, height: 60, bgcolor: '#114539', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>🎥</Box>
                                            ) : (
                                                <Box sx={{ width: 60, height: 60, bgcolor: '#f0f0f0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📎</Box>
                                            )}
                                            <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {decodeURIComponent(step.contentUrl.split('/').pop() || '')}
                                            </Typography>
                                            <IconButton size="small" color="error" onClick={() => updateStep(index, 'contentUrl', '')}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                disabled={uploadingStep === index}
                                                startIcon={uploadingStep === index ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                                sx={{ borderColor: '#114539', color: '#114539', '&:hover': { bgcolor: 'rgba(17,69,57,0.04)' } }}
                                            >
                                                {uploadingStep === index ? `Yuklanmoqda ${uploadProgress}%` : `${step.contentType === 'video' ? '🎥 Video' : step.contentType === 'audio' ? '🎵 Audio' : step.contentType === 'image' ? '📷 Rasm' : '📄 Fayl'} yuklash`}
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept={step.contentType === 'video' ? 'video/*' : step.contentType === 'audio' ? 'audio/*' : step.contentType === 'image' ? 'image/*' : '*'}
                                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(index, f); }}
                                                />
                                            </Button>
                                            {uploadingStep === index && (
                                                <Box sx={{ mt: 1, maxWidth: 300 }}>
                                                    <Box sx={{ height: 4, bgcolor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                                                        <Box sx={{ height: '100%', width: `${uploadProgress}%`, bgcolor: '#114539', transition: 'width 0.3s' }} />
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* AI Preview */}
                            {step.aiEnabled && (
                                <Box mt={1}>
                                    <Button variant="outlined" size="small" onClick={() => handlePreview(index)} disabled={previewing === index}
                                        startIcon={previewing === index ? <CircularProgress size={16} /> : null}
                                        sx={{ borderColor: '#9333ea', color: '#9333ea', '&:hover': { borderColor: '#7c3aed', bgcolor: 'rgba(147,51,234,0.04)' } }}>
                                        {previewing === index ? 'Generatsiya...' : '🤖 AI xabarni ko\'rish'}
                                    </Button>
                                    {previewText[index] && (
                                        <Paper sx={{ mt: 1.5, p: 2, bgcolor: 'rgba(147,51,234,0.04)', borderRadius: 2, border: '1px solid rgba(147,51,234,0.15)' }}>
                                            <Typography variant="caption" sx={{ color: '#9333ea', fontWeight: 700, display: 'block', mb: 0.5 }}>AI natija:</Typography>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{previewText[index]}</Typography>
                                        </Paper>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <Button variant="outlined" onClick={addStep} fullWidth
                    sx={{ borderColor: '#114539', color: '#114539', borderStyle: 'dashed', py: 1.5, fontWeight: 600, '&:hover': { borderColor: '#0a8069', bgcolor: 'rgba(17,69,57,0.04)' } }}>
                    + Qadam qo'shish
                </Button>
            </Box>
        </SimpleForm>
    );
};

// ── Analytics Page ──
export const AiAnalytics = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/automations/analytics')
            .then(r => r.json())
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box p={4}><CircularProgress /></Box>;
    if (!data) return <Alert severity="error" sx={{ m: 3 }}>Ma'lumot yuklanmadi</Alert>;

    return (
        <Box p={3} maxWidth={1100}>
            <Typography variant="h4" sx={{ color: '#114539', fontWeight: 800, mb: 3 }}>🧠 AI Analytics</Typography>

            {/* Engagement Overview */}
            <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>📊 Engagement</Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap={2}>
                    <StatCard label="O'rtacha ball" value={data.engagement.avgScore} color="#114539" />
                    <StatCard label="Jami foydalanuvchilar" value={data.engagement.totalUsers} color="#0a8069" />
                    {Object.entries(data.engagement.segments || {}).map(([seg, count]) => (
                        <StatCard key={seg} label={seg.toUpperCase()} value={count as number} color={seg === 'vip' ? '#d97706' : seg === 'hot' ? '#dc2626' : seg === 'warm' ? '#f59e0b' : '#6b7280'} />
                    ))}
                </Box>
            </Paper>

            {/* Retention */}
            <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#114539', fontWeight: 700, mb: 2 }}>📈 Retention</Typography>
                <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                    <StatCard label="Yuborilgan" value={data.retention.totalQueued} color="#2563eb" />
                    <StatCard label="Qaytganlar" value={data.retention.totalReturned} color="#16a34a" />
                    <StatCard label="Retention Rate" value={`${data.retention.retentionRate}%`} color="#114539" />
                </Box>
            </Paper>

            {/* AI vs Regular */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <Paper sx={{ p: 3, borderRadius: 4 }}>
                    <Typography variant="h6" sx={{ color: '#9333ea', fontWeight: 700, mb: 2 }}>🤖 AI vs Oddiy</Typography>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <StatCard label="AI rate" value={`${data.aiVsRegular.ai.rate}%`} color="#9333ea" />
                        <StatCard label="Oddiy rate" value={`${data.aiVsRegular.regular.rate}%`} color="#6b7280" />
                    </Box>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: 4 }}>
                    <Typography variant="h6" sx={{ color: '#d97706', fontWeight: 700, mb: 2 }}>🔬 A/B Test</Typography>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <StatCard label="Variant A" value={`${data.abTest.A.rate}%`} color="#2563eb" />
                        <StatCard label="Variant B" value={`${data.abTest.B.rate}%`} color="#9333ea" />
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

// ── Resource Export ──
export default {
    list: AutomationList,
    show: AutomationShow,
    edit: AutomationEdit,
    create: AutomationCreate,
    icon: SmartToyIcon,
    options: { label: 'Avtomatizatsiya' },
};
