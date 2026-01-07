/**
 * BrandMotion - Motion Engine
 * Calculates the exact timing frame for every element in a scene.
 * This is the "Brain" that ensures consistency.
 */

import { SCENE_DURATIONS } from '../config/useCaseTemplates.js';
import { TONES } from '../config/brandProfile.js';

export class MotionEngine {
    constructor(brandProfile) {
        this.tone = TONES[brandProfile?.tone || 'modern'];
    }

    /**
     * Calculate timings for a single scene
     * @param {Object} scene The scene config
     * @param {number} startTime Offset in the master timeline
     */
    calculateSceneTimings(scene, startTime = 0) {
        let durationMs;
        if (typeof scene.duration === 'number') {
            durationMs = scene.duration * 1000; // Convert sec to ms
        } else {
            // Fallback for string presets
            durationMs = SCENE_DURATIONS[scene.duration || 'medium'] || 5000;
        }

        // Tone modifier (e.g., 'energetic' makes things 20% faster)
        // We adjust the effective internal timings, but keep total duration fixed for predictability

        // Standard BrandMotion Timing Model:
        // Entry: 0% -> 20%
        // Hold: 20% -> 80%
        // Exit: 80% -> 100%

        const entryDuration = Math.round(durationMs * 0.2);
        const exitDuration = Math.round(durationMs * 0.2);
        const holdDuration = durationMs - entryDuration - exitDuration;

        return {
            sceneId: scene.id,
            totalDuration: durationMs,
            startTime: startTime,
            endTime: startTime + durationMs,
            phases: {
                entry: {
                    start: 0,
                    end: entryDuration,
                    duration: entryDuration
                },
                hold: {
                    start: entryDuration,
                    end: entryDuration + holdDuration,
                    duration: holdDuration
                },
                exit: {
                    start: entryDuration + holdDuration,
                    end: durationMs,
                    duration: exitDuration
                }
            }
        };
    }

    /**
     * Calculate master timeline for all scenes
     * @param {Array} scenes List of scenes
     */
    calculateMasterTimeline(scenes) {
        let currentTime = 0;
        const timeline = [];

        scenes.forEach(scene => {
            const sceneTiming = this.calculateSceneTimings(scene, currentTime);
            timeline.push(sceneTiming);
            currentTime += sceneTiming.totalDuration;
        });

        return {
            totalDuration: currentTime,
            sceneTimings: timeline
        };
    }
}

export default new MotionEngine({});
