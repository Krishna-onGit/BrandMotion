import React, { useMemo, useState, useEffect, useRef } from 'react';
import MotionEngine from '../../engine/motionEngine';
import { MOTION_PRESETS, EXIT_PAIRS } from '../../config/motionPresets';
import { getContrastColor } from '../../engine/utils';

/**
 * Generates the keyframe CSS for a given animation definition.
 */
function generateKeyframesCSS(name, props) {
    let css = `@keyframes ${name} {`;
    css += ` 0% { opacity: ${props.opacity[0]}; transform: ${props.transform ? props.transform[0] : 'none'}; }`;
    css += ` 100% { opacity: ${props.opacity[1]}; transform: ${props.transform ? props.transform[1] : 'none'}; }`;
    css += `}`;
    return css;
}

const FONT_SIZES = {
    '16:9': { small: '1.5rem', medium: '2.5rem', large: '4rem', xl: '6rem' },
    '9:16': { small: '1.2rem', medium: '2rem', large: '3rem', xl: '4rem' },
    '1:1': { small: '1.5rem', medium: '2.5rem', large: '4rem', xl: '6rem' }
};

const SUBTEXT_SIZES = {
    '16:9': { small: '1rem', medium: '1.5rem', large: '2rem', xl: '3rem' },
    '9:16': { small: '0.8rem', medium: '1.2rem', large: '1.5rem', xl: '2rem' },
    '1:1': { small: '1rem', medium: '1.5rem', large: '2rem', xl: '3rem' }
};

function SequencePreview({ scenes, brand, activeSceneId, audio, aspectRatio = '16:9', mode = 'scene' }) {
    const [playTrigger, setPlayTrigger] = useState(0);
    const audioRef = useRef(null);

    // Parse Aspect Ratio
    const aspectStyle = useMemo(() => {
        const [w, h] = aspectRatio.split(':').map(Number);
        return { aspectRatio: `${w}/${h || 1}` };
    }, [aspectRatio]);

    // Sync Audio with Play Trigger
    useEffect(() => {
        if (audioRef.current && audio?.enabled && audio?.dataUrl) {
            audioRef.current.currentTime = 0;
            audioRef.current.volume = audio.volume || 0.5;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => { });
            }
        }
    }, [playTrigger, audio]);

    // Re-calculate the timeline
    const timeline = useMemo(() => {
        return MotionEngine.calculateMasterTimeline(scenes);
    }, [scenes, brand.tone]);

    // Loop Logic
    useEffect(() => {
        let timer;
        // Loop restart buffer (continuous loop)
        if (timeline.totalDuration > 0) {
            timer = setTimeout(() => {
                setPlayTrigger(prev => prev + 1);
            }, timeline.totalDuration + 500); // 500ms pause before loop
        }
        return () => clearTimeout(timer);
    }, [playTrigger, timeline.totalDuration]);

    // Auto-Reset on Changes
    useEffect(() => {
        setPlayTrigger(p => p + 1);
    }, [scenes, aspectRatio, mode]);

    // Generate all dynamic CSS for the sequence
    const { styles } = useMemo(() => {
        let css = '';

        // Global Visibility Keyframes
        css += `
      @keyframes sceneVis {
        0%, 99% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;

        timeline.sceneTimings.forEach((timing, index) => {
            const scene = scenes.find(s => s.id === timing.sceneId);
            const preset = MOTION_PRESETS[scene.animation || 'fadeIn'];
            const exitPresetId = EXIT_PAIRS[scene.animation || 'fadeIn'];
            const exitPreset = MOTION_PRESETS[exitPresetId];

            const sceneClass = `preview-scene-${index}`;

            const sceneStart = timing.startTime / 1000;
            const entryDuration = timing.phases.entry.duration / 1000;
            const holdDuration = timing.phases.hold.duration / 1000;
            const exitDuration = timing.phases.exit.duration / 1000;
            const exitStart = sceneStart + entryDuration + holdDuration;

            // --- BACKGROUND STYLES ---
            const bg = scene.background || { type: 'color' };

            if (bg.type === 'image' && bg.url) {
                const overlayOpacity = bg.overlay === 'high' ? 0.7 : bg.overlay === 'low' ? 0.2 : 0.4;
                const blurFilter = bg.blur ? 'blur(4px)' : 'none';

                if (bg.motion) {
                    css += `
            @keyframes ${sceneClass}-zoom {
              0% { transform: scale(1); }
              100% { transform: scale(1.1); }
            }
           `;
                }

                css += `
          .${sceneClass}-bg {
            position: absolute;
            inset: -20px;
            background-image: url('${bg.url}');
            background-size: cover;
            background-position: center;
            z-index: 0;
            filter: ${blurFilter};
            ${bg.motion ? `animation: ${sceneClass}-zoom ${timing.totalDuration / 1000}s ease-in-out forwards;` : ''}
          }
          .${sceneClass}-overlay {
            position: absolute;
            inset: 0;
            background-color: #000;
            opacity: ${overlayOpacity};
            z-index: 1;
          }
        `;
            } else {
                const bgValue = bg.type === 'gradient' ? bg.value : (bg.value || brand.colors.secondary);
                css += `
           .${sceneClass}-bg {
             position: absolute;
             inset: 0;
             background: ${bgValue};
             z-index: 0;
           }
         `;
            }

            // Scene Container
            css += `
        .${sceneClass} {
          opacity: 0;
          animation: sceneVis ${timing.totalDuration / 1000}s linear ${sceneStart}s forwards;
          z-index: ${index + 1};
          overflow: hidden;
        }
      `;

            // Headline Animation
            const entryKeyframe = `${sceneClass}-headline-entry`;
            const exitKeyframe = `${sceneClass}-headline-exit`;

            css += generateKeyframesCSS(entryKeyframe, preset.props);
            css += generateKeyframesCSS(exitKeyframe, exitPreset.props);

            css += `
        .${sceneClass} .headline {
          opacity: 0;
          position: relative; 
          z-index: 2;
          animation: 
            ${entryKeyframe} ${entryDuration}s ${preset.curve} ${sceneStart}s forwards,
            ${exitKeyframe} ${exitDuration}s ${exitPreset.curve} ${exitStart}s forwards;
        }
      `;

            if (scene.subtext) {
                const subEntryKeyframe = `${sceneClass}-subtext-entry`;
                const subDelay = sceneStart + (entryDuration * 0.5);
                css += generateKeyframesCSS(subEntryKeyframe, preset.props);
                css += `
          .${sceneClass} .subtext {
            opacity: 0;
            position: relative;
            z-index: 2;
            animation: 
              ${subEntryKeyframe} ${entryDuration}s ${preset.curve} ${subDelay}s forwards,
              ${exitKeyframe} ${exitDuration}s ${exitPreset.curve} ${exitStart}s forwards;
          }
        `;
            }
        });

        return { styles: css };
    }, [timeline, scenes, brand]);

    return (
        <div className="flex items-center justify-center w-full h-full">
            {audio?.enabled && audio?.dataUrl && (
                <audio ref={audioRef} src={audio.dataUrl} loop />
            )}

            <style>{styles}</style>

            <div
                key={playTrigger}
                className="relative bg-zinc-950 shadow-2xl overflow-hidden group transition-all duration-300"
                style={{
                    ...aspectStyle,
                    width: aspectRatio === '9:16' ? 'auto' : '100%',
                    height: aspectRatio === '9:16' ? '100%' : 'auto',
                    maxHeight: '100%',
                    maxWidth: '100%'
                }}
            >
                {scenes.map((scene, index) => {
                    const bg = scene.background || { type: 'color' };
                    const isImage = bg.type === 'image' && bg.url;

                    // Contrast & Color
                    let headlineColor = brand.colors.primary;
                    let subtextColor = '#e4e4e7';

                    if (!isImage) {
                        const bgValue = bg.type === 'gradient' ? bg.value : (bg.value || brand.colors.secondary);
                        const contrastMode = getContrastColor(bgValue);
                        if (contrastMode === '#000000') {
                            headlineColor = '#000000';
                            subtextColor = '#18181b';
                        } else {
                            headlineColor = brand.colors.primary;
                            subtextColor = '#e4e4e7';
                        }
                    }

                    // Manual Color Override
                    if (scene.textColor) {
                        headlineColor = scene.textColor;
                        subtextColor = scene.textColor;
                    }

                    // Text Styles
                    const sizeKey = scene.textSize || 'medium';
                    const fontSize = FONT_SIZES[aspectRatio]?.[sizeKey] || FONT_SIZES['16:9'].medium;
                    const subFontSize = SUBTEXT_SIZES[aspectRatio]?.[sizeKey] || SUBTEXT_SIZES['16:9'].medium;
                    const textAlign = scene.textAlign || 'center';

                    // Font Family Mapping
                    const fontMap = {
                        modern: 'Inter, sans-serif',
                        elegant: 'Playfair Display, serif',
                        tech: 'Fira Code, monospace',
                        display: 'Bebas Neue, sans-serif'
                    };
                    const fontFamily = fontMap[scene.fontFamily] || fontMap.modern;


                    return (
                        <div
                            key={scene.id}
                            className={`preview-scene-${index} absolute inset-0 flex flex-col items-center justify-center p-8 text-center`}
                            style={{
                                alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
                                textAlign: textAlign
                            }}
                        >
                            <div className={`preview-scene-${index}-bg`} />
                            {isImage && <div className={`preview-scene-${index}-overlay`} />}

                            <h2
                                className="headline mb-4 leading-tight"
                                style={{
                                    fontFamily: fontFamily,
                                    color: headlineColor,
                                    fontSize: fontSize,
                                    fontWeight: 700,
                                    textShadow: isImage ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {scene.headline}
                            </h2>
                            {scene.subtext && (
                                <p
                                    className="subtext"
                                    style={{
                                        fontFamily: 'Inter, sans-serif', // Subtext usually simple
                                        color: subtextColor,
                                        fontSize: subFontSize,
                                        fontWeight: 400,
                                        textShadow: isImage ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                >
                                    {scene.subtext}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SequencePreview;
