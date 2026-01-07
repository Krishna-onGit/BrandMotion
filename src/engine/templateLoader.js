/**
 * Template Loader
 * Loads and validates animation templates from JSON
 * Provides methods to query and filter templates
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class TemplateLoader {
    constructor() {
        this.templates = null;
        this.loaded = false;
    }

    /**
     * Load templates from JSON file
     * @returns {Object} Loaded templates
     */
    load() {
        if (this.loaded) return this.templates;

        try {
            const templatePath = join(__dirname, '..', 'templates', 'templates.json');
            const raw = readFileSync(templatePath, 'utf-8');
            this.templates = JSON.parse(raw);
            this.loaded = true;
            console.log(`✅ Loaded ${this.templates.animations.length} animation templates`);
            return this.templates;
        } catch (error) {
            console.error('❌ Failed to load templates:', error.message);
            throw new Error('Template loading failed');
        }
    }

    /**
     * Get all animations
     * @returns {Array} List of animations
     */
    getAnimations() {
        this.load();
        return this.templates.animations;
    }

    /**
     * Get animation by ID
     * @param {string} id Animation ID
     * @returns {Object|null} Animation object
     */
    getAnimation(id) {
        this.load();
        return this.templates.animations.find(a => a.id === id) || null;
    }

    /**
     * Get animations by category
     * @param {string} category Category name
     * @returns {Array} Filtered animations
     */
    getAnimationsByCategory(category) {
        this.load();
        return this.templates.animations.filter(a => a.category === category);
    }

    /**
     * Get all backgrounds
     * @returns {Array} List of backgrounds
     */
    getBackgrounds() {
        this.load();
        return this.templates.backgrounds;
    }

    /**
     * Get background by ID
     * @param {string} id Background ID
     * @returns {Object|null} Background object
     */
    getBackground(id) {
        this.load();
        return this.templates.backgrounds.find(b => b.id === id) || null;
    }

    /**
     * Get aspect ratio config
     * @param {string} ratio Aspect ratio string (e.g., "16:9")
     * @returns {Object|null} Aspect ratio config
     */
    getAspectRatio(ratio) {
        this.load();
        return this.templates.aspectRatios[ratio] || null;
    }

    /**
     * Get all aspect ratios
     * @returns {Object} All aspect ratio configs
     */
    getAspectRatios() {
        this.load();
        return this.templates.aspectRatios;
    }

    /**
     * Get all fonts
     * @returns {Array} List of fonts
     */
    getFonts() {
        this.load();
        return this.templates.fonts;
    }

    /**
     * Get font by ID
     * @param {string} id Font ID
     * @returns {Object|null} Font object
     */
    getFont(id) {
        this.load();
        return this.templates.fonts.find(f => f.id === id) || null;
    }

    /**
     * Validate template configuration
     * @param {Object} config User configuration
     * @returns {Object} Validated config with defaults
     */
    validateConfig(config) {
        const errors = [];
        const validated = { ...config };

        // Validate animation
        if (!config.animationId) {
            validated.animationId = 'fadeIn'; // Default
        } else if (!this.getAnimation(config.animationId)) {
            errors.push(`Unknown animation: ${config.animationId}`);
        }

        // Validate background
        if (!config.backgroundId) {
            validated.backgroundId = 'darkGradient'; // Default
        } else if (!this.getBackground(config.backgroundId)) {
            errors.push(`Unknown background: ${config.backgroundId}`);
        }

        // Validate aspect ratio
        if (!config.aspectRatio) {
            validated.aspectRatio = '16:9'; // Default
        } else if (!this.getAspectRatio(config.aspectRatio)) {
            errors.push(`Unknown aspect ratio: ${config.aspectRatio}`);
        }

        // Validate font
        if (!config.fontId) {
            validated.fontId = 'inter'; // Default
        } else if (!this.getFont(config.fontId)) {
            errors.push(`Unknown font: ${config.fontId}`);
        }

        if (errors.length > 0) {
            throw new Error(`Validation errors: ${errors.join(', ')}`);
        }

        return validated;
    }
}

// Singleton instance
const templateLoader = new TemplateLoader();

export default templateLoader;
export { TemplateLoader };
