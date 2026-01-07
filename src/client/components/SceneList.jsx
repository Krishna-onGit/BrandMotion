import React from 'react';
import { MOTION_PRESETS } from '../../config/motionPresets';

export default function SceneList({
    scenes,
    activeSceneId,
    onSceneSelect,
    onAddScene,
    onDeleteScene
}) {
    const getAnimationLabel = (id) => MOTION_PRESETS[id]?.name || id;

    return (
        <div className="flex flex-col gap-3 h-full">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2">Scenes</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {scenes.map((scene, index) => (
                    <div
                        key={scene.id}
                        onClick={() => onSceneSelect(scene.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all group relative ${activeSceneId === scene.id
                            ? 'border-sky-500 bg-zinc-800'
                            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeSceneId === scene.id ? 'bg-sky-500/20 text-sky-400' : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                #{index + 1}
                            </span>
                            {scenes.length > 1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteScene(scene.id); }}
                                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <h4 className="font-medium text-sm truncate text-zinc-200">{scene.headline || "Untitled Scene"}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                            {getAnimationLabel(scene.animation)} • {scene.duration}
                        </p>
                    </div>
                ))}

                <button
                    onClick={onAddScene}
                    className="w-full py-3 rounded-lg border border-dashed border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors text-xs font-bold uppercase tracking-wide"
                >
                    + Add Scene
                </button>
            </div>
        </div>
    );
}
