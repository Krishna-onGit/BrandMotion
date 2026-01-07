import React, { useState, useEffect, useMemo } from 'react';
import BrandSetup from './components/BrandSetup';
import TemplatePicker from './components/TemplatePicker';
import SceneList from './components/SceneList';
import PropertyPanel from './components/PropertyPanel';
import SequencePreview from './components/SequencePreview';
import ProjectDashboard from './components/ProjectDashboard';
import ExportModal from './components/ExportModal';
import { saveProject, createNewProject } from '../utils/storage';
import { BRAND_DEFAULTS } from '../config/brandProfile';
import { v4 as uuidv4 } from 'uuid';
import MotionEngine from '../engine/motionEngine';

function App() {
    // State Machine: 'landing' -> 'brand' -> 'template' -> 'editor'
    const [step, setStep] = useState('landing');
    const [currentProjectId, setCurrentProjectId] = useState(null);

    // Data State
    const [brand, setBrand] = useState(BRAND_DEFAULTS);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [scenes, setScenes] = useState([]);
    const [activeSceneId, setActiveSceneId] = useState(null);
    const [previewMode, setPreviewMode] = useState('scene'); // 'scene' | 'full'

    const [audio, setAudio] = useState({
        enabled: false,
        dataUrl: null,
        fileName: null,
        volume: 0.5,
        fade: true
    });

    // Export State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportJobId, setExportJobId] = useState(null);
    const [exportState, setExportState] = useState({
        status: 'idle', // idle, exporting, success, error
        progress: 0,
        message: 'Ready',
        result: null,
        error: null
    });

    // Autosave
    useEffect(() => {
        if (currentProjectId && step !== 'landing') {
            const timer = setTimeout(() => {
                saveProject({
                    id: currentProjectId,
                    name: brand.name || 'Untitled Project',
                    brand,
                    scenes,
                    audio
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [brand, scenes, audio, currentProjectId, step]);

    // Polling Export Status
    useEffect(() => {
        if (!exportJobId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/jobs/${exportJobId}`);
                const data = await res.json();

                if (data.success) {
                    const job = data.data;

                    if (job.status === 'completed') {
                        setExportState(prev => ({
                            ...prev,
                            status: 'success',
                            result: { url: job.outputUrl, filename: job.outputFilename },
                            progress: 100,
                            message: 'Finalizing...'
                        }));
                        setExportJobId(null);
                    } else if (job.status === 'failed') {
                        setExportState(prev => ({
                            ...prev,
                            status: 'error',
                            error: job.error || 'Export failed',
                            progress: 0
                        }));
                        setExportJobId(null);
                    } else {
                        // Map status to message
                        let msg = 'Processing...';
                        if (job.status === 'generating_html') msg = 'Preparing Scenes...';
                        if (job.status === 'rendering') msg = 'Rendering Animation...';
                        if (job.status === 'encoding') msg = 'Encoding Video...';

                        setExportState(prev => ({
                            ...prev,
                            status: 'exporting',
                            progress: job.progress,
                            message: msg
                        }));
                    }
                }
            } catch (err) {
                console.error("Poll Error:", err);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [exportJobId]);


    // Project Handlers
    const handleNewProject = () => {
        const p = createNewProject(BRAND_DEFAULTS);
        setCurrentProjectId(p.id);
        setBrand(BRAND_DEFAULTS);
        setScenes([]);
        setAudio({ enabled: false, volume: 0.5, fade: true });
        setStep('brand');
    };

    const handleOpenProject = (project) => {
        setCurrentProjectId(project.id);
        setBrand(project.brand || BRAND_DEFAULTS);
        setScenes(project.scenes || []);
        setActiveSceneId(project.scenes?.[0]?.id || null);
        setAudio(project.audio || { enabled: false, volume: 0.5, fade: true });

        if (project.scenes && project.scenes.length > 0) {
            setStep('editor');
        } else if (project.brand && project.brand.name) {
            setStep('template');
        } else {
            setStep('brand');
        }
    };

    // Handlers
    const handleTemplateSelect = (template) => {
        // Hydrate template scenes with unique IDs
        const hydratedScenes = template.scenes.map(s => ({
            ...s,
            id: uuidv4() // Ensure unique IDs
        }));
        setScenes(hydratedScenes);
        setActiveSceneId(hydratedScenes[0].id);
        setStep('editor');
    };

    const handleUpdateScene = (id, field, value) => {
        setScenes(prev => prev.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const handleAddScene = () => {
        if (scenes.length >= 10) {
            alert("Maximum 10 scenes allowed in v1.");
            return;
        }
        const newScene = {
            id: uuidv4(),
            headline: "New Scene",
            subtext: "",
            animation: "fadeIn",
            duration: 5
        };
        setScenes(prev => [...prev, newScene]);
        setActiveSceneId(newScene.id);
    };

    const handleDeleteScene = (id) => {
        const newScenes = scenes.filter(s => s.id !== id);
        setScenes(newScenes);
        if (activeSceneId === id && newScenes.length > 0) {
            setActiveSceneId(newScenes[0].id);
        }
    };

    // EXPORT LOGIC
    const handleExportRequest = () => {
        // If already busy or showing result, just open
        if (exportState.status === 'exporting' || exportState.result) {
            setIsExportModalOpen(true);
            return;
        }

        if (scenes.length === 0) {
            alert("Please add at least one scene.");
            return;
        }

        // Reset only if starting fresh flow
        if (exportState.status !== 'exporting') {
            setExportState({ status: 'idle', progress: 0, message: 'Ready', result: null, error: null });
        }
        setIsExportModalOpen(true);
    };

    const startExport = async ({ quality }) => {
        setExportState({ status: 'exporting', progress: 0, message: 'Initializing...', result: null, error: null });

        const payload = {
            brand,
            scenes,
            aspectRatio, // Dynamic now
            quality,     // Passed from modal
            audio: audio.enabled ? {
                dataUrl: audio.dataUrl,
                volume: audio.volume,
                fade: audio.fade
            } : null
        };

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.success) {
                setExportJobId(data.jobId);
            } else {
                throw new Error(data.error || 'Server rejected request');
            }
        } catch (e) {
            setExportState(prev => ({
                ...prev,
                status: 'error',
                error: e.message || 'Network error'
            }));
        }
    };

    const handleCancelExport = () => {
        setExportJobId(null);
        setExportState(prev => ({ ...prev, status: 'idle', message: 'Cancelled' }));
        // Ideally tell backend to cancel, but v1 just stops polling
    };

    // Calculate Duration for UI
    const totalDuration = useMemo(() => {
        // Reuse engine logic or simulate
        const timeline = MotionEngine.calculateMasterTimeline(scenes);
        return timeline.totalDuration / 1000;
    }, [scenes]);

    // Render Step Content
    const renderStep = () => {
        switch (step) {
            case 'landing':
                return <ProjectDashboard onOpenProject={handleOpenProject} onNewProject={handleNewProject} />;
            case 'brand':
                return <BrandSetup brand={brand} setBrand={setBrand} onNext={() => setStep('template')} />;
            case 'template':
                return <TemplatePicker onSelect={handleTemplateSelect} />;
            case 'editor':
                return (
                    <div className="grid grid-cols-12 h-[calc(100vh-65px)] bg-zinc-950 overflow-hidden absolute top-[65px] left-0 right-0 bottom-0 z-10">
                        {/* Sidebar */}
                        <div className="col-span-2 bg-zinc-950 border-r border-zinc-800 p-2 overflow-hidden flex flex-col">
                            <SceneList
                                scenes={scenes}
                                activeSceneId={activeSceneId}
                                onSceneSelect={(id) => {
                                    setActiveSceneId(id);
                                    setPreviewMode('scene');
                                }}
                                onAddScene={handleAddScene}
                                onDeleteScene={handleDeleteScene}
                            />
                        </div>

                        {/* Center Preview */}
                        <div className="col-span-7 bg-zinc-900 flex flex-col relative overflow-hidden">
                            {/* Toolbar */}
                            <div className="h-12 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center px-4 shrink-0">
                                {/* Aspect Ratio */}
                                <div className="flex gap-1">
                                    {['16:9', '9:16', '1:1'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setAspectRatio(r)}
                                            className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${aspectRatio === r ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>

                                {/* Preview Mode */}
                                <div className="flex bg-zinc-900 rounded p-0.5 border border-zinc-800">
                                    <button
                                        onClick={() => setPreviewMode('scene')}
                                        className={`text-[10px] uppercase font-bold px-3 py-1 rounded-sm transition-colors ${previewMode === 'scene' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        Scene
                                    </button>
                                    <button
                                        onClick={() => setPreviewMode('full')}
                                        className={`text-[10px] uppercase font-bold px-3 py-1 rounded-sm transition-colors ${previewMode === 'full' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                    >
                                        Full Video
                                    </button>
                                </div>
                                <div className="w-10"></div> {/* Spacer */}
                            </div>

                            {/* Canvas Area */}
                            <div className="flex-1 flex items-center justify-center bg-[url('/grid-bg.png')] bg-zinc-900 relative overflow-hidden p-6">
                                <SequencePreview
                                    scenes={previewMode === 'scene' ? scenes.filter(s => s.id === activeSceneId) : scenes}
                                    brand={brand}
                                    activeSceneId={activeSceneId}
                                    audio={audio}
                                    aspectRatio={aspectRatio}
                                    mode={previewMode}
                                />
                            </div>
                        </div>

                        {/* Right Properties */}
                        <div className="col-span-3 bg-zinc-950 border-l border-zinc-800 overflow-hidden flex flex-col">
                            <PropertyPanel
                                activeScene={scenes.find(s => s.id === activeSceneId)}
                                onUpdateScene={handleUpdateScene}
                                brand={brand}
                            />
                        </div>
                    </div>
                );
            default:
                return <div>Unknown step</div>;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            {/* Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => exportState.status !== 'exporting' && setIsExportModalOpen(false)}
                onCancel={handleCancelExport}
                onExport={startExport}
                isExporting={exportState.status === 'exporting'}
                progress={exportState.progress}
                status={exportState.message}
                exportResult={exportState.result}
                error={exportState.error}
                aspectRatio={aspectRatio}
                totalDuration={totalDuration}
            />

            {/* Header */}
            <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 h-[65px]">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setStep('landing')}>
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white">B</div>
                        <h1 className="text-xl font-bold">BrandMotion</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {step === 'editor' && (
                            <button
                                onClick={handleExportRequest}
                                className={`
                                    ${exportState.status === 'exporting' ? 'bg-zinc-800 border border-indigo-500/50 text-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}
                                    text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg flex items-center gap-2
                                `}
                            >
                                {exportState.status === 'exporting' ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                                        <span>{Math.round(exportState.progress)}%</span>
                                    </>
                                ) : (
                                    <>
                                        <span>EXPORT</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-[1920px] mx-auto min-h-[calc(100vh-65px)]">
                {renderStep()}
            </main>
        </div>
    );
}

export default App;
