/**
 * Utility functions for color and math operations
 */

/**
 * Calculates the best text color (black or white) for a given background color
 * using YIQ consistency.
 * @param {string} hexColor - Browser supported hex color (e.g. #ffffff, #000)
 * @returns {string} - '#000000' or '#ffffff'
 */
export function getContrastColor(hexColor) {
    if (!hexColor) return '#ffffff';

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hexColor = hexColor.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    if (!result) return '#ffffff';

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // If background is bright (>128), use dark text. Else white.
    return (yiq >= 128) ? '#000000' : '#ffffff';
}
