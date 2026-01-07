import React, { useState, useEffect } from 'react';

/**
 * OutputPanel Component
 * Displays generated video and download options
 */
function OutputPanel({ outputUrl, isGenerating, progress, error }) {
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    // Auto-download when URL is ready
    useEffect(() => {
        if (outputUrl && !isDownloading) {
            handleDownload();
        }
    }, [outputUrl]);

    // Handle download
    const handleDownload = async () => {
        if (!outputUrl) return;

        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const response = await fetch(outputUrl);
            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;

            const reader = response.body.getReader();
            const chunks = [];
            let received = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                received += value.length;

                if (total) {
                    setDownloadProgress((received / total) * 100);
                }
            }

            const blob = new Blob(chunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `motiontext-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    // Error state
    if (error) {
        return (
            <div className="card border-red-500/30">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-400">Generation Failed</h3>
                        <p className="text-sm text-zinc-400 mt-1">{error}</p>
                        <p className="text-xs text-zinc-500 mt-3">
                            Make sure FFmpeg is installed and the backend server is running.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!outputUrl && !isGenerating) {
        return (
            <div className="card border-dashed">
                <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-400">No Video Yet</h3>
                    <p className="text-sm text-zinc-500 mt-2">
                        Configure your text and style, then click Generate Video
                    </p>
                </div>
            </div>
        );
    }

    // Generating state
    if (isGenerating) {
        return (
            <div className="card">
                <div className="py-8 text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium">Creating Your Video</h3>
                    <p className="text-sm text-zinc-400 mt-2">
                        This may take a moment...
                    </p>
                    <div className="mt-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800">
                            <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            <span className="text-sm text-zinc-400">
                                {progress < 20 && 'Generating animation...'}
                                {progress >= 20 && progress < 60 && 'Rendering frames...'}
                                {progress >= 60 && progress < 90 && 'Encoding video...'}
                                {progress >= 90 && 'Almost done...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state with video
    return (
        <div className="card border-green-500/30 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-semibold text-green-400">Video Ready!</h3>
                    <p className="text-xs text-zinc-500">Your animation has been generated</p>
                </div>
            </div>

            {/* Video Player */}
            <div className="rounded-lg overflow-hidden bg-black mb-4">
                <video
                    src={outputUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full"
                    style={{ maxHeight: '400px' }}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="btn btn-primary flex-1"
                >
                    {isDownloading ? (
                        <>
                            <div className="spinner spinner-sm border-white" />
                            <span>{Math.round(downloadProgress)}%</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download MP4</span>
                        </>
                    )}
                </button>

                <a
                    href={outputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    title="Open in new tab"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            {/* Share hint */}
            <p className="text-xs text-zinc-500 text-center mt-4">
                Video is saved on the server at <code className="text-zinc-400">{outputUrl}</code>
            </p>
        </div>
    );
}

export default OutputPanel;
