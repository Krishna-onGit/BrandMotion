import React, { useState } from 'react';
import { MOTION_PRESETS } from '../../config/motionPresets';

export default function PropertyPanel({
    activeScene,
    onUpdateScene,
    brand
}) {
    const [activeTab, setActiveTab] = useState('text');

    if (!activeScene) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                Select a scene to edit properties
            </div>
        );
    }

    const handleUpdate = (field, value) => {
        onUpdateScene(activeScene.id, field, value);
    };

    const handleBackgroundChange = (field, value) => {
        const currentBg = activeScene.background || { type: 'color' };
        onUpdateScene(activeScene.id, 'background', { ...currentBg, [field]: value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                handleBackgroundChange('url', ev.target.result);
                handleBackgroundChange('type', 'image');
                handleBackgroundChange('overlay', 'medium');
                handleBackgroundChange('blur', true);
                handleBackgroundChange('motion', true);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                {['text', 'background', 'motion'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === tab
                            ? 'text-white border-b-2 border-sky-500 bg-zinc-800'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* TEXT TAB */}
                {activeTab === 'text' && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="form-group">
                            <label className="label">Headline Text</label>
                            <textarea
                                className="input text-base font-bold min-h-[80px]"
                                value={activeScene.headline || ''}
                                onChange={(e) => handleUpdate('headline', e.target.value)}
                                placeholder="Main message..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Supporting Text</label>
                            <textarea
                                className="input min-h-[60px]"
                                value={activeScene.subtext || ''}
                                onChange={(e) => handleUpdate('subtext', e.target.value)}
                                placeholder="Optional details..."
                            />
                        </div>

                        {/* Text Styles (V1) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">Align</label>
                                <div className="flex rounded bg-zinc-950 p-1 border border-zinc-800">
                                    {['left', 'center', 'right'].map(align => (
                                        <button
                                            key={align}
                                            onClick={() => handleUpdate('textAlign', align)}
                                            className={`flex-1 py-1 rounded hover:bg-zinc-800 ${activeScene.textAlign === align ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                                        >
                                            {align === 'left' && <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" /></svg>}
                                            {align === 'center' && <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
                                            {align === 'right' && <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M7 18h13" /></svg>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Size</label>
                                <select
                                    className="input select"
                                    value={activeScene.textSize || 'medium'}
                                    onChange={(e) => handleUpdate('textSize', e.target.value)}
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="xl">Extra Large</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Font Family</label>
                            <select
                                className="input select"
                                value={activeScene.fontFamily || 'modern'}
                                onChange={(e) => handleUpdate('fontFamily', e.target.value)}
                            >
                                <option value="modern">Modern Sans</option>
                                <option value="elegant">Elegant Serif</option>
                                <option value="tech">Tech Mono</option>
                                <option value="display">Display Bold</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Text Color</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleUpdate('textColor', null)}
                                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${!activeScene.textColor ? 'bg-sky-500/20 text-sky-400 border-sky-500/50' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    Auto
                                </button>
                                <div className={`flex-1 flex items-center gap-2 transition-opacity ${!activeScene.textColor ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    <input
                                        type="color"
                                        value={activeScene.textColor || '#ffffff'}
                                        onChange={(e) => handleUpdate('textColor', e.target.value)}
                                        className="w-8 h-8 rounded border border-zinc-700 cursor-pointer p-0 bg-transparent"
                                    />
                                    <span className="text-xs font-mono text-zinc-500">{activeScene.textColor || 'Auto'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BACKGROUND TAB */}
                {activeTab === 'background' && (
                    <div className="space-y-5 animate-fadeIn">
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
                                <label className="label">Color</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-700 shadow-sm shrink-0">
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
                                        className="input font-mono uppercase"
                                    />
                                </div>
                            </div>
                        )}

                        {(activeScene.background?.type === 'image') && (
                            <div className="space-y-4">
                                <div className="form-group">
                                    <div className="relative group">
                                        {activeScene.background?.url ? (
                                            <img src={activeScene.background.url} className="w-full h-32 object-cover rounded-lg border border-zinc-700" />
                                        ) : (
                                            <div className="w-full h-32 bg-zinc-950 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500">
                                                No Image Selected
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
                                            <span className="text-xs font-bold text-white border border-white/50 px-3 py-1 rounded-full">
                                                Upload New
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="form-group">
                                        <label className="label text-[10px]">Overlay</label>
                                        <select
                                            className="input select text-xs h-8 min-h-0 py-0"
                                            value={activeScene.background?.overlay || 'medium'}
                                            onChange={(e) => handleBackgroundChange('overlay', e.target.value)}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="form-group flex flex-col items-center">
                                        <label className="label text-[10px] mb-1">Blur</label>
                                        <input
                                            type="checkbox"
                                            checked={!!activeScene.background?.blur}
                                            onChange={(e) => handleBackgroundChange('blur', e.target.checked)}
                                            className="toggle toggle-xs toggle-primary"
                                        />
                                    </div>
                                    <div className="form-group flex flex-col items-center">
                                        <label className="label text-[10px] mb-1">Motion</label>
                                        <input
                                            type="checkbox"
                                            checked={!!activeScene.background?.motion}
                                            onChange={(e) => handleBackgroundChange('motion', e.target.checked)}
                                            className="toggle toggle-xs toggle-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* MOTION TAB */}
                {activeTab === 'motion' && (
                    <div className="space-y-5 animate-fadeIn">
                        <div className="form-group">
                            <label className="label">Entry Animation</label>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.values(MOTION_PRESETS)
                                    .filter(p => p.type === 'entry')
                                    .map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleUpdate('animation', p.id)}
                                            className={`p-3 text-left rounded border transition-all ${activeScene.animation === p.id
                                                ? 'bg-zinc-800 border-sky-500 ring-1 ring-sky-500'
                                                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                                                }`}
                                        >
                                            <div className="font-semibold text-sm">{p.name}</div>
                                            <div className="text-[10px] text-zinc-500 mt-1"> Smooth entry effect</div>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="label mb-0">Duration (Seconds)</label>
                                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
                                    {typeof activeScene.duration === 'number' ? activeScene.duration : 5}s
                                </span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="12"
                                step="0.5"
                                value={typeof activeScene.duration === 'number' ? activeScene.duration : 5}
                                onChange={(e) => handleUpdate('duration', parseFloat(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between px-1 mt-1">
                                <span className="text-[10px] text-zinc-600">2s</span>
                                <span className="text-[10px] text-zinc-600">7s</span>
                                <span className="text-[10px] text-zinc-600">12s</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
