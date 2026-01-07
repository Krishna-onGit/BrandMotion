import React from 'react';

/**
 * TextEditor Component
 * Text input with formatting controls
 */
function TextEditor({ text, setText, fontSize, setFontSize, textColor, setTextColor }) {
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Your Text
                </h2>
                <span className="text-xs text-zinc-500">{text.length} characters</span>
            </div>

            {/* Text Input */}
            <div className="form-group">
                <textarea
                    className="input font-medium"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your text here..."
                    rows={4}
                    style={{ fontSize: '1.125rem' }}
                />
            </div>

            {/* Formatting Controls */}
            <div className="grid grid-cols-2 gap-4">
                {/* Font Size */}
                <div className="form-group mb-0">
                    <label className="label">Font Size</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="24"
                            max="144"
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                            className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                        <span className="text-sm font-mono text-zinc-400 w-12 text-right">
                            {fontSize}px
                        </span>
                    </div>
                </div>

                {/* Text Color */}
                <div className="form-group mb-0">
                    <label className="label">Text Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-zinc-700 bg-transparent"
                        />
                        <input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="input flex-1 font-mono text-sm"
                            pattern="^#[0-9A-Fa-f]{6}$"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Color Presets */}
            <div className="mt-4 pt-4 border-t border-zinc-700">
                <label className="label text-xs mb-2">Quick Colors</label>
                <div className="flex gap-2">
                    {['#ffffff', '#f8fafc', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb7185'].map((color) => (
                        <button
                            key={color}
                            onClick={() => setTextColor(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${textColor === color ? 'border-white scale-110' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TextEditor;
