import React from 'react';
import { MOTION_PRESETS } from '../../config/motionPresets';
import { SCENE_DURATIONS } from '../../config/useCaseTemplates';

function SceneEditor({
    scenes,
    activeSceneId,
    onSceneSelect,
    onUpdateScene,
    onDeleteScene,
    onAddScene
}) {
    const activeScene = scenes.find(s => s.id === activeSceneId);

    const getAnimationLabel = (id) => MOTION_PRESETS[id]?.name || id;

    const handleUpdate = (field, value) => {
        onUpdateScene(activeSceneId, field, value);
    };

    const handleBackgroundChange = (field, value) => {
        const currentBg = activeScene.background || { type: 'color' };
        onUpdateScene(activeSceneId, 'background', { ...currentBg, [field]: value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                handleBackgroundChange('url', ev.target.result);
                handleBackgroundChange('type', 'image');
                // Set default robust settings
                handleBackgroundChange('overlay', 'medium');
                handleBackgroundChange('blur', true);
                handleBackgroundChange('motion', true);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

            {/* Scene List (Sidebar) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Scenes</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {scenes.map((scene, index) => (
                        <div
                            key={scene.id}
                            onClick={() => onSceneSelect(scene.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all group relative ${activeSceneId === scene.id
                                ? 'border-sky-500 bg-zinc-800'
                                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="badge badge-info text-[10px] px-1.5 py-0.5">
                                    SCENE {index + 1}
                                </span>
                                {scenes.length > 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id); }}
                                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <h4 className="font-semibold text-sm truncate">{scene.headline || "Untitled Scene"}</h4>
                            <p className="text-xs text-zinc-500 mt-1 truncate">
                                {getAnimationLabel(scene.animation)} • {scene.duration}
                            </p>
                        </div>
                    ))}

                    <button
                        onClick={onAddScene}
                        className="w-full py-3 rounded-lg border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium"
                    >
                        + Add Scene
                    </button>
                </div>
            </div>

            {/* Editor (Main) */}
            <div className="lg:col-span-8">
                {activeScene ? (
                    <div className="card animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Edit Scene</h2>
                            <span className="text-xs text-zinc-500 font-mono">ID: {activeScene.id}</span>
                        </div>

                        {/* Content Form */}
                        <div className="space-y-5">
                            <div className="form-group">
                                <label className="label">Headline (Focus)</label>
                                <input
                                    className="input text-lg font-bold"
                                    value={activeScene.headline}
                                    onChange={(e) => handleUpdate('headline', e.target.value)}
                                    placeholder="Main message..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Supporting Text</label>
                                <textarea
                                    className="input"
                                    value={activeScene.subtext}
                                    onChange={(e) => handleUpdate('subtext', e.target.value)}
                                    placeholder="Optional details..."
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Animation Style</label>
                                    <select
                                        className="input select"
                                        value={activeScene.animation}
                                        onChange={(e) => handleUpdate('animation', e.target.value)}
                                    >
                                        {Object.values(MOTION_PRESETS)
                                            .filter(p => p.type === 'entry') // Only show entry presets
                                            .map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="label">Duration</label>
                                    <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                                        {['short', 'medium', 'long'].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => handleUpdate('duration', d)}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${activeScene.duration === d
                                                    ? 'bg-zinc-800 text-white shadow-sm'
                                                    : 'text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Background Settings */}
                            <div className="pt-6 border-t border-zinc-800">
                                <h3 className="text-sm font-semibold text-zinc-400 mb-4">Background Settings</h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="label">Type</label>
                                        <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                                            {['color', 'image'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => handleBackgroundChange('type', t)}
                                                    className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${(activeScene.background?.type || 'color') === t
                                                        ? 'bg-zinc-800 text-white shadow-sm'
                                                        : 'text-zinc-500 hover:text-zinc-300'
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {(activeScene.background?.type === 'color' || !activeScene.background?.type) && (
                                        <div className="form-group">
                                            <label className="label">Background Color</label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative w-9 h-9 rounded-md overflow-hidden border border-zinc-700 shadow-sm shrink-0">
                                                    <input
                                                        type="color"
                                                        value={activeScene.background?.value || '#0f172a'}
                                                        onChange={(e) => handleBackgroundChange('value', e.target.value)}
                                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer p-0 border-0"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={activeScene.background?.value || '#0f172a'}
                                                    onChange={(e) => handleBackgroundChange('value', e.target.value)}
                                                    className="input text-xs font-mono uppercase flex-1 min-w-0"
                                                    placeholder="#HEX"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(activeScene.background?.type === 'image') && (
                                        <div className="form-group">
                                            <label className="label">Image Source</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="bg-upload"
                                                />
                                                <label
                                                    htmlFor="bg-upload"
                                                    className="w-full py-2 px-3 text-xs bg-zinc-900 border border-zinc-700 rounded cursor-pointer hover:border-zinc-500 flex items-center justify-center gap-2 truncate text-zinc-400"
                                                >
                                                    {activeScene.background?.url ? 'Change Image' : 'Upload Image'}
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(activeScene.background?.type === 'image') && (
                                    <div className="grid grid-cols-3 gap-4 animate-fadeIn">
                                        <div className="form-group">
                                            <label className="label">Overlay</label>
                                            <select
                                                className="input select text-xs"
                                                value={activeScene.background?.overlay || 'medium'}
                                                onChange={(e) => handleBackgroundChange('overlay', e.target.value)}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div className="form-group flex items-center justify-between border border-zinc-800 rounded px-3 bg-zinc-900/50">
                                            <label className="label mb-0 cursor-pointer" htmlFor="chk-blur">Blur</label>
                                            <input
                                                id="chk-blur"
                                                type="checkbox"
                                                checked={!!activeScene.background?.blur}
                                                onChange={(e) => handleBackgroundChange('blur', e.target.checked)}
                                                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-sky-500 focus:ring-sky-500"
                                            />
                                        </div>

                                        <div className="form-group flex items-center justify-between border border-zinc-800 rounded px-3 bg-zinc-900/50">
                                            <label className="label mb-0 cursor-pointer" htmlFor="chk-motion">Motion</label>
                                            <input
                                                id="chk-motion"
                                                type="checkbox"
                                                checked={!!activeScene.background?.motion}
                                                onChange={(e) => handleBackgroundChange('motion', e.target.checked)}
                                                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-sky-500 focus:ring-sky-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500">
                        Select a scene to edit
                    </div>
                )}
            </div>
        </div>
    );
}

export default SceneEditor;
