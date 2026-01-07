import React from 'react';

/**
 * StyleSelector Component
 * Template and style selection controls
 */
function StyleSelector({
    templates,
    animationId, setAnimationId,
    backgroundId, setBackgroundId,
    aspectRatio, setAspectRatio,
    fontId, setFontId,
}) {
    if (!templates) return null;

    const { animations, backgrounds, aspectRatios, fonts } = templates;

    // Group animations by category
    const animationsByCategory = animations.reduce((acc, anim) => {
        const cat = anim.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(anim);
        return acc;
    }, {});

    const categoryLabels = {
        basic: '🎯 Basic',
        motion: '🚀 Motion',
        special: '✨ Special',
        cinematic: '🎬 Cinematic',
        '3d': '🧊 3D',
    };

    return (
        <div className="card">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Style Options
            </h2>

            {/* Animation Selection */}
            <div className="form-group">
                <label className="label">Animation Style</label>
                <div className="space-y-4">
                    {Object.entries(animationsByCategory).map(([category, anims]) => (
                        <div key={category}>
                            <p className="text-xs text-zinc-500 mb-2">{categoryLabels[category] || category}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {anims.map((anim) => (
                                    <button
                                        key={anim.id}
                                        onClick={() => setAnimationId(anim.id)}
                                        className={`p-3 rounded-lg border text-left transition-all ${animationId === anim.id
                                                ? 'border-sky-500 bg-sky-500/10'
                                                : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                            }`}
                                    >
                                        <span className="block text-sm font-medium">{anim.name}</span>
                                        <span className="block text-xs text-zinc-500 mt-1">{anim.duration}s</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Selection */}
            <div className="form-group">
                <label className="label">Background</label>
                <div className="grid grid-cols-4 gap-2">
                    {backgrounds.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => setBackgroundId(bg.id)}
                            className={`h-14 rounded-lg border-2 transition-all overflow-hidden ${backgroundId === bg.id
                                    ? 'border-sky-500 ring-2 ring-sky-500/30'
                                    : 'border-transparent hover:border-zinc-600'
                                }`}
                            style={{
                                background: bg.type === 'gradient' ? bg.value : bg.value,
                            }}
                            title={bg.name}
                        />
                    ))}
                </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="form-group">
                <label className="label">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-3">
                    {Object.entries(aspectRatios).map(([ratio, config]) => {
                        const icons = {
                            '16:9': (
                                <svg className="w-8 h-5" viewBox="0 0 32 20" fill="currentColor">
                                    <rect width="32" height="20" rx="2" opacity="0.3" />
                                    <rect x="4" y="4" width="24" height="12" rx="1" />
                                </svg>
                            ),
                            '9:16': (
                                <svg className="w-5 h-8" viewBox="0 0 20 32" fill="currentColor">
                                    <rect width="20" height="32" rx="2" opacity="0.3" />
                                    <rect x="4" y="4" width="12" height="24" rx="1" />
                                </svg>
                            ),
                            '1:1': (
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <rect width="24" height="24" rx="2" opacity="0.3" />
                                    <rect x="4" y="4" width="16" height="16" rx="1" />
                                </svg>
                            ),
                        };

                        return (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${aspectRatio === ratio
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                    }`}
                            >
                                <div className={aspectRatio === ratio ? 'text-sky-400' : 'text-zinc-500'}>
                                    {icons[ratio]}
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-medium">{ratio}</span>
                                    <span className="block text-xs text-zinc-500">{config.label.split(' ')[0]}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Font Selection */}
            <div className="form-group mb-0">
                <label className="label">Font Family</label>
                <select
                    value={fontId}
                    onChange={(e) => setFontId(e.target.value)}
                    className="input select"
                >
                    {fonts.map((font) => (
                        <option key={font.id} value={font.id}>
                            {font.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default StyleSelector;
