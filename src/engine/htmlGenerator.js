/**
 * HTML Sequence Generator
 * Generates a master HTML file for the entire multi-scene sequence.
 */

import { MOTION_PRESETS, EXIT_PAIRS } from '../config/motionPresets.js';
import { getContrastColor } from './utils.js';

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

export function generateSequenceHTML(config, timeline) {
  const { brand, aspectRatio = '16:9' } = config;
  const { sceneTimings } = timeline;

  // 1. Setup Global Styles (Fonts, Colors)
  // Hardcoded to ensure all required fonts are available for Puppeteer
  const fontImport = `https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&family=Fira+Code:wght@400&family=Bebas+Neue&display=swap`;
  const { primary, secondary } = brand.colors;

  // 2. Generate CSS for each scene
  let css = '';
  let html = '';

  sceneTimings.forEach((timing, index) => {
    const scene = config.scenes.find(s => s.id === timing.sceneId);
    const preset = MOTION_PRESETS[scene.animation || 'fadeIn'];
    const exitPresetId = EXIT_PAIRS[scene.animation || 'fadeIn'];
    const exitPreset = MOTION_PRESETS[exitPresetId];

    // Unique class for this scene
    const sceneClass = `scene-${index}`;

    // Calculate global start times (in seconds)
    const sceneStart = timing.startTime / 1000;
    const entryDuration = timing.phases.entry.duration / 1000;
    const holdDuration = timing.phases.hold.duration / 1000;
    const exitDuration = timing.phases.exit.duration / 1000;
    const exitStart = sceneStart + entryDuration + holdDuration;

    // --- BACKGROUND LAYER ---
    const bg = scene.background || { type: 'color', value: brand.colors.secondary };
    let bgHtml = '';

    if (bg.type === 'image' && bg.url) {
      // Image Background with Overlay & Motion
      const blur = bg.blur ? 'filter: blur(4px);' : '';
      const overlayOpacity = bg.overlay === 'high' ? 0.7 : bg.overlay === 'low' ? 0.2 : 0.4; // Default medium

      // Ken Burns Animation
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
          inset: -20px; /* Overlap to prevent edges showing during blur/move */
          background-image: url('${bg.url}');
          background-size: cover;
          background-position: center;
          z-index: 0;
          ${blur}
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
      bgHtml = `
        <div class="${sceneClass}-bg"></div>
        <div class="${sceneClass}-overlay"></div>
      `;
    } else {
      // Solid/Gradient Background
      const bgValue = bg.type === 'gradient' ? bg.value : (bg.value || brand.colors.secondary);
      css += `
        .${sceneClass}-bg {
          position: absolute;
          inset: 0;
          background: ${bgValue};
          z-index: 0;
        }
      `;
      bgHtml = `<div class="${sceneClass}-bg"></div>`;
    }

    // --- SCENE CONTAINER (Visibility) ---
    // Scene is visible from start to end
    const textAlign = scene.textAlign || 'center';
    const alignItems = textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';

    css += `
      .${sceneClass} {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0;
        animation: sceneVis ${timing.totalDuration / 1000}s linear ${sceneStart}s forwards;
        z-index: ${index + 1};
        overflow: hidden;
        padding: 50px; /* Add padding similar to Preview p-12 */
      }
      /* Content Layer on top of BG */
      .${sceneClass} .content-layer {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: ${alignItems};
        text-align: ${textAlign};
        width: 100%;
        max-width: 1200px;
      }
    `;

    // --- ELEMENTS ANIMATION ---
    // Calculate Contrast
    let headlineColor = primary;
    let subTextColor = secondary;

    if (bg.type !== 'image') {
      const bgValue = bg.type === 'gradient' ? bg.value : (bg.value || brand.colors.secondary);
      const contrastMode = getContrastColor(bgValue);

      if (contrastMode === '#000000') {
        // Light BG -> Dark Text
        headlineColor = '#000000';
        subTextColor = '#18181b';
      }
    }

    // Manual Color Override
    if (scene.textColor) {
      headlineColor = scene.textColor;
      subtextColor = scene.textColor;
    }

    const headlineDelay = sceneStart; // Starts immediately at scene start
    const subtextDelay = sceneStart + (entryDuration * 0.5); // Lag behind

    // Font Sizing logic
    const sizeKey = scene.textSize || 'medium';
    const fontSize = FONT_SIZES[aspectRatio]?.[sizeKey] || FONT_SIZES['16:9'].medium;
    const subFontSize = SUBTEXT_SIZES[aspectRatio]?.[sizeKey] || SUBTEXT_SIZES['16:9'].medium;

    // Font Family Mapping
    const fontMap = {
      modern: `'${brand.fonts.headline}', sans-serif`,
      elegant: "'Playfair Display', serif",
      tech: "'Fira Code', monospace",
      display: "'Bebas Neue', sans-serif"
    };
    const fontFamily = fontMap[scene.fontFamily] || fontMap.modern;


    // Headline Entry
    css += generateKeyframes(`${sceneClass}-headline-entry`, preset.props);
    css += `
      .${sceneClass} .headline {
        font-family: ${fontFamily} !important;
        font-size: ${fontSize} !important;
        font-weight: 700;
        color: ${headlineColor};
        margin-bottom: 20px;
        opacity: 0;
        line-height: 1.1;
        white-space: pre-wrap;
        /* Entry Animation */
        animation: ${sceneClass}-headline-entry ${entryDuration}s ${preset.curve} ${headlineDelay}s forwards,
                   ${sceneClass}-headline-exit ${exitDuration}s ${exitPreset.curve} ${exitStart}s forwards;
      }
    `;

    // Headline Exit
    css += generateKeyframes(`${sceneClass}-headline-exit`, exitPreset.props);

    // Subtext Entry (if exists)
    if (scene.subtext) {
      css += generateKeyframes(`${sceneClass}-subtext-entry`, preset.props);
      css += `
        .${sceneClass} .subtext {
          font-family: 'Inter', sans-serif !important;
          font-size: ${subFontSize} !important;
          color: ${subTextColor}; 
          opacity: 0;
          font-weight: 400;
          white-space: pre-wrap;
          animation: ${sceneClass}-subtext-entry ${entryDuration}s ${preset.curve} ${subtextDelay}s forwards,
                     ${sceneClass}-headline-exit ${exitDuration}s ${exitPreset.curve} ${exitStart}s forwards;
        }
      `;
    }

    // HTML Structure
    html += `
      <div class="${sceneClass}">
        ${bgHtml}
        <div class="content-layer">
          <div class="headline">${scene.headline}</div>
          ${scene.subtext ? `<div class="subtext">${scene.subtext}</div>` : ''}
        </div>
      </div>
    `;
  });

  // Global Keyframes
  css += `
    @keyframes sceneVis {
      0%, 99% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;

  // Page Template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('${fontImport}');
    body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      /* Default bg color if no scene bg */
      background-color: #000; 
      overflow: hidden;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

// Helper to gen keyframes from props
function generateKeyframes(name, props) {
  let kf = `@keyframes ${name} {`;
  // Minimal implementation assuming [from, to] arrays
  // For production, this needs robust parsing like the original file had
  kf += ` 0% { opacity: ${props.opacity[0]}; transform: ${props.transform ? props.transform[0] : 'none'}; }`;
  kf += ` 100% { opacity: ${props.opacity[1]}; transform: ${props.transform ? props.transform[1] : 'none'}; }`;
  kf += `}`;
  return kf;
}

export default { generateSequenceHTML };
