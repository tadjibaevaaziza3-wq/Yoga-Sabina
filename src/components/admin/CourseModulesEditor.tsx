'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight, FileAudio, FileText, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoUpload from './VideoUpload';
import FileUpload from './FileUpload'; // We need to create this

export default function CourseModulesEditor({ modules, setModules }: { modules: any[], setModules: (m: any[]) => void }) {
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    const toggleModule = (id: string) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addModule = () => {
        const newModule = {
            id: `temp-${Date.now()}`,
            title: 'Yangi Modul',
            lessons: []
        };
        setModules([...modules, newModule]);
        setExpandedModules(prev => ({ ...prev, [newModule.id]: true }));
    };

    const addLesson = (moduleId: string) => {
        const updatedModules = modules.map(m => {
            if (m.id === moduleId) {
                return {
                    ...m,
                    lessons: [...(m.lessons || []), {
                        id: `temp-lesson-${Date.now()}`,
                        title: 'Yangi Dars',
                        duration: 0,
                        isFree: false
                    }]
                };
            }
            return m;
        });
        setModules(updatedModules);
    };

    const updateModule = (id: string, field: string, value: any) => {
        setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const updateLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
        setModules(modules.map(m => {
            if (m.id === moduleId) {
                return {
                    ...m,
                    lessons: m.lessons.map((l: any) => l.id === lessonId ? { ...l, [field]: value } : l)
                };
            }
            return m;
        }));
    };

    const removeModule = (id: string) => {
        if (confirm('Modulni o\'chirishni tasdiqlaysizmi?')) {
            setModules(modules.filter(m => m.id !== id));
        }
    };

    const removeLesson = (moduleId: string, lessonId: string) => {
        if (confirm('Darsni o\'chirishni tasdiqlaysizmi?')) {
            setModules(modules.map(m => {
                if (m.id === moduleId) {
                    return { ...m, lessons: m.lessons.filter((l: any) => l.id !== lessonId) };
                }
                return m;
            }));
        }
    };

    const onDragEnd = (result: any) => {
        const { source, destination, type } = result;

        if (!destination) return;

        if (type === 'module') {
            const reorderedModules = Array.from(modules);
            const [removed] = reorderedModules.splice(source.index, 1);
            reorderedModules.splice(destination.index, 0, removed);
            setModules(reorderedModules);
        } else {
            // Lesson reordering
            const sourceModuleIndex = modules.findIndex(m => m.id === source.droppableId);
            const destModuleIndex = modules.findIndex(m => m.id === destination.droppableId);

            if (sourceModuleIndex === -1 || destModuleIndex === -1) return;

            const newModules = Array.from(modules);
            const sourceModule = { ...newModules[sourceModuleIndex] };
            const destModule = sourceModuleIndex === destModuleIndex
                ? sourceModule
                : { ...newModules[destModuleIndex] };

            const sourceLessons = Array.from(sourceModule.lessons);
            const [movedLesson] = sourceLessons.splice(source.index, 1);

            if (sourceModuleIndex === destModuleIndex) {
                sourceLessons.splice(destination.index, 0, movedLesson);
                sourceModule.lessons = sourceLessons;
                newModules[sourceModuleIndex] = sourceModule;
            } else {
                const destLessons = Array.from(destModule.lessons);
                destLessons.splice(destination.index, 0, movedLesson);

                sourceModule.lessons = sourceLessons;
                destModule.lessons = destLessons;

                newModules[sourceModuleIndex] = sourceModule;
                newModules[destModuleIndex] = destModule;
            }

            setModules(newModules);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif">Modullar va Darslar</h3>
                <button type="button" onClick={addModule} className="btn-luxury px-6 py-3 rounded-xl text-xs flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Modul Qo'shish
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="modules" type="module">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {modules.map((module, index) => (
                                <Draggable key={module.id} draggableId={module.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="border border-[var(--border)] rounded-2xl bg-[var(--card-bg)] overflow-hidden"
                                        >
                                            {/* Module Header */}
                                            <div className="p-4 bg-[var(--secondary)]/30 flex items-center gap-4">
                                                <div {...provided.dragHandleProps}>
                                                    <GripVertical className="w-5 h-5 opacity-30 cursor-grab" />
                                                </div>
                                                <button type="button" onClick={() => toggleModule(module.id)}>
                                                    {expandedModules[module.id] ? <ChevronDown className="w-5 h-5 opacity-50" /> : <ChevronRight className="w-5 h-5 opacity-50" />}
                                                </button>
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        value={module.title}
                                                        onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                                                        className="bg-transparent font-bold text-lg focus:outline-none placeholder-opacity-50"
                                                        placeholder="Modul Nomi (UZ)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={module.titleRu || ''}
                                                        onChange={(e) => updateModule(module.id, 'titleRu', e.target.value)}
                                                        className="bg-transparent font-medium text-lg opacity-40 focus:outline-none"
                                                        placeholder="Название модуля (RU)"
                                                    />
                                                </div>
                                                <button type="button" onClick={() => removeModule(module.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Lessons List */}
                                            <AnimatePresence>
                                                {expandedModules[module.id] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-[var(--border)]"
                                                    >
                                                        <Droppable droppableId={module.id} type="lesson">
                                                            {(lProvided) => (
                                                                <div {...lProvided.droppableProps} ref={lProvided.innerRef} className="p-4 space-y-4">
                                                                    {module.lessons?.map((lesson: any, lIndex: number) => (
                                                                        <Draggable key={lesson.id} draggableId={lesson.id} index={lIndex}>
                                                                            {(dProvided) => (
                                                                                <div
                                                                                    ref={dProvided.innerRef}
                                                                                    {...dProvided.draggableProps}
                                                                                    className="pl-4 border-l-2 border-[var(--border)] space-y-4 py-4 relative group/lesson"
                                                                                >
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div {...dProvided.dragHandleProps}>
                                                                                            <GripVertical className="w-4 h-4 opacity-20 cursor-grab hover:opacity-100 transition-opacity" />
                                                                                        </div>
                                                                                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-xs font-bold shrink-0">
                                                                                            {lIndex + 1}
                                                                                        </div>
                                                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={lesson.title}
                                                                                                onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                                                                                                className="bg-[var(--secondary)]/50 px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none font-bold"
                                                                                                placeholder="Dars mavzusi (UZ)"
                                                                                            />
                                                                                            <input
                                                                                                type="text"
                                                                                                value={lesson.titleRu || ''}
                                                                                                onChange={(e) => updateLesson(module.id, lesson.id, 'titleRu', e.target.value)}
                                                                                                className="bg-[var(--secondary)]/30 px-4 py-3 rounded-xl border border-[var(--border)] focus:outline-none opacity-60"
                                                                                                placeholder="Тема урока (RU)"
                                                                                            />
                                                                                        </div>
                                                                                        <button type="button" onClick={() => removeLesson(module.id, lesson.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg">
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>

                                                                                    {/* Media Uploads */}
                                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-12 lg:pl-16">
                                                                                        <div className="space-y-2">
                                                                                            <label className="text-[10px] uppercase font-bold opacity-50 flex items-center gap-2">
                                                                                                <Video className="w-3 h-3" /> Video
                                                                                            </label>
                                                                                            <VideoUpload
                                                                                                title="Video Upload"
                                                                                                subtitle="Maximum 5000MB"
                                                                                                icon={<Video className="w-6 h-6" />}
                                                                                                onUploadComplete={(path, url) => updateLesson(module.id, lesson.id, 'videoUrl', url)}
                                                                                                bucket="lessons"
                                                                                                path={`lessons/${lesson.id}/video`}
                                                                                                maxSizeMB={5000}
                                                                                                accept="video/*"
                                                                                            />
                                                                                            {lesson.videoUrl && <div className="text-[10px] text-green-500 truncate mt-1 bg-green-500/5 p-1 rounded">✅ {lesson.videoUrl.split('/').pop()}</div>}
                                                                                        </div>

                                                                                        <div className="space-y-2">
                                                                                            <label className="text-[10px] uppercase font-bold opacity-50 flex items-center gap-2">
                                                                                                <FileAudio className="w-3 h-3" /> Audio (MP3)
                                                                                            </label>
                                                                                            <VideoUpload
                                                                                                title="Audio Upload"
                                                                                                subtitle="MP3/WAV Fayllar"
                                                                                                icon={<FileAudio className="w-6 h-6" />}
                                                                                                onUploadComplete={(path, url) => updateLesson(module.id, lesson.id, 'audioUrl', url)}
                                                                                                bucket="lessons"
                                                                                                path={`lessons/${lesson.id}/audio`}
                                                                                                maxSizeMB={500}
                                                                                                accept="audio/*"
                                                                                            />
                                                                                            {lesson.audioUrl && <div className="text-[10px] text-indigo-500 truncate mt-1 bg-indigo-500/5 p-1 rounded">✅ {lesson.audioUrl.split('/').pop()}</div>}
                                                                                        </div>

                                                                                        <div className="space-y-2">
                                                                                            <label className="text-[10px] uppercase font-bold opacity-50 flex items-center gap-2">
                                                                                                <FileText className="w-3 h-3" /> Fayllar
                                                                                            </label>
                                                                                            <VideoUpload
                                                                                                title="Document Upload"
                                                                                                subtitle="PDF/DOC/ZIP Fayllar"
                                                                                                icon={<FileText className="w-6 h-6" />}
                                                                                                onUploadComplete={(path, url) => updateLesson(module.id, lesson.id, 'pdfUrl', url)}
                                                                                                bucket="assets"
                                                                                                path={`lessons/${lesson.id}/files`}
                                                                                                maxSizeMB={200}
                                                                                                accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar"
                                                                                            />
                                                                                            {lesson.pdfUrl && <div className="text-[10px] text-amber-500 truncate mt-1 bg-amber-500/5 p-1 rounded">✅ {lesson.pdfUrl.split('/').pop()}</div>}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {lProvided.placeholder}
                                                                    <button type="button" onClick={() => addLesson(module.id)} className="w-full py-3 border border-dashed border-[var(--border)] rounded-xl text-sm font-bold opacity-50 hover:opacity-100 hover:bg-[var(--secondary)] transition-all flex items-center justify-center gap-2">
                                                                        <Plus className="w-4 h-4" /> Dars Qo'shish
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {modules.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-[2rem] opacity-50">
                    <p>Hozircha modullar yo'q</p>
                </div>
            )}
        </div>
    );
}
