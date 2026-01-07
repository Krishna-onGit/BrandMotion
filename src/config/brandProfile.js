/**
 * BrandMotion - Brand Defaults & Validation
 * Defines the structure for brand profiles and enforced rules.
 */

export const BRAND_DEFAULTS = {
    // Brand Identity
    name: "My Brand",
    logo: null, // path or base64

    // Colors (System enforces 3-color palette)
    colors: {
        primary: "#0ea5e9",   // Main brand color
        secondary: "#0f172a", // Text/Background contrast
        accent: "#f59e0b"     // Highlights/CTAs
    },

    // Typography (Locked hierarchy)
    fonts: {
        headline: "Inter",
        body: "Inter"
    },

    // Personality (Influences automatic timing/spacing)
    tone: "modern", // minimal | bold | premium | energetic

    // System Rules (Immutable)
    rules: {
        maxTextLength: {
            headline: 40,
            subtext: 80
        },
        contrastRatio: 4.5, // AA standard enforced
        safeZone: "10%"     // Margin enforcement
    }
};

export const TONES = {
    minimal: { speed: 1.0, spacing: 1.2, rough: false },
    bold: { speed: 1.2, spacing: 0.9, rough: false },
    premium: { speed: 0.8, spacing: 1.4, rough: false },
    energetic: { speed: 1.5, spacing: 1.0, rough: true }
};

export default { BRAND_DEFAULTS, TONES };
