import React from 'react';

function GenerateButton({ onClick, isGenerating, progress }) {
    return (
        <div className="card gradient-border">
            <div className="flex flex-col items-center py-4">
                <button
                    onClick={onClick}
                    disabled={isGenerating}
                    className={`btn w-full max-w-sm text-lg py-4 ${isGenerating
                            ? 'bg-zinc-700 cursor-not-allowed'
                            : 'btn-primary animate-pulse-glow'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <div className="spinner spinner-sm border-white mr-2"></div>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <span>Generate Video</span>
                    )}
                </button>

                {isGenerating && (
                    <div className="w-full max-w-sm mt-4">
                        <div className="flex justify-between text-xs text-zinc-400 mb-2">
                            <span>Processing...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 text-center">
                            {progress < 20 && 'Generating animation...'}
                            {progress >= 20 && progress < 60 && 'Rendering frames...'}
                            {progress >= 60 && progress < 90 && 'Encoding MP4...'}
                            {progress >= 90 && 'Finalizing...'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GenerateButton;
