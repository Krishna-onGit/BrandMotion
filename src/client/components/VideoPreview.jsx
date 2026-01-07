import React, { useMemo } from 'react';

/**
 * VideoPreview Component
 * Live preview of the animation configuration
 */
function VideoPreview({
    text,
    animationId,
    backgroundId,
    aspectRatio,
    fontId,
    textColor,
    fontSize,
    templates,
}) {
    // Get template data
    const animation = useMemo(() => {
        return templates?.animations?.find(a => a.id === animationId);
    }, [templates, animationId]);

    const background = useMemo(() => {
        return templates?.backgrounds?.find(b => b.id === backgroundId);
    }, [templates, backgroundId]);

    const font = useMemo(() => {
        return templates?.fonts?.find(f => f.id === fontId);
    }, [templates, fontId]);

    // Aspect ratio class
    const aspectClass = {
        '16:9': '',
        '9:16': 'aspect-9-16',
        '1:1': 'aspect-1-1',
    }[aspectRatio] || '';

    // Generate preview styles
    const previewStyle = useMemo(() => {
        const bg = background?.type === 'gradient'
            ? background.value
            : background?.value || '#000';

        return {
            background: bg,
        };
    }, [background]);

    const textStyle = useMemo(() => ({
        color: textColor,
        fontSize: `${Math.min(fontSize / 3, 48)}px`, // Scale down for preview
        fontFamily: font?.family || 'Inter, sans-serif',
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: 1.3,
        maxWidth: '90%',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    }), [textColor, fontSize, font]);

    // Generate animation keyframes dynamically
    const animationCSS = useMemo(() => {
        if (!animation) return '';

        if (animation.isTypewriter) {
            return `
        @keyframes preview-typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes preview-blink {
          from, to { border-color: transparent; }
          50% { border-color: currentColor; }
        }
      `;
        }

        const keyframes = Object.entries(animation.keyframes)
            .map(([percent, props]) => {
                const cssProps = Object.entries(props)
                    .map(([key, value]) => {
                        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                        return `${cssKey}: ${value}`;
                    })
                    .join('; ');
                return `${percent} { ${cssProps} }`;
            })
            .join('\n');

        return `
      @keyframes preview-animation {
        ${keyframes}
      }
    `;
    }, [animation]);

    const textAnimationStyle = useMemo(() => {
        if (!animation) return {};

        if (animation.isTypewriter) {
            return {
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                borderRight: '3px solid currentColor',
                animation: `preview-typewriter ${animation.duration}s steps(${text.length}, end) forwards, preview-blink 0.75s step-end infinite`,
            };
        }

        return {
            animation: `preview-animation ${animation.duration}s ${animation.easing} infinite`,
        };
    }, [animation, text.length]);

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Preview
                </h2>
                <div className="flex items-center gap-2">
                    <span className="badge badge-info">{aspectRatio}</span>
                    <span className="text-xs text-zinc-500">{animation?.name}</span>
                </div>
            </div>

            {/* Inject animation keyframes */}
            <style>{animationCSS}</style>

            {/* Preview Container */}
            <div className={`preview-container ${aspectClass}`} style={previewStyle}>
                <div className="preview-content p-4">
                    <div
                        key={`${animationId}-${text}`} // Re-trigger animation on change
                        style={{ ...textStyle, ...textAnimationStyle }}
                    >
                        {text || 'Enter your text...'}
                    </div>
                </div>
            </div>

            {/* Preview Info */}
            <div className="mt-4 pt-4 border-t border-zinc-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Duration</p>
                        <p className="text-sm font-medium">{animation?.duration || 1}s</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Animation</p>
                        <p className="text-sm font-medium">{animation?.name || 'None'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Font</p>
                        <p className="text-sm font-medium">{font?.name || 'Inter'}</p>
                    </div>
                </div>
            </div>

            {/* Animation tip */}
            <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Preview shows looping animation. Final video will play once with hold frame.
                </p>
            </div>
        </div>
    );
}

export default VideoPreview;
