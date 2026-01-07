import React from 'react';
import { TEMPLATES } from '../../config/useCaseTemplates';

function TemplatePicker({ onSelect }) {
    return (
        <div className="max-w-4xl mx-auto animate-slideUp">
            <h2 className="text-3xl font-bold mb-2">Choose a Start Point</h2>
            <p className="text-zinc-400 mb-8">Select a template to auto-structure your video.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATES.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className="card card-hover text-left p-6 group relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-sky-400 transition-colors">
                                {template.name}
                            </h3>
                            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                                {template.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    {template.scenes.length} Scenes
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    ~{template.scenes.length * 5}s
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default TemplatePicker;
