/**
 * Video Generation Pipeline
 * Orchestrates the complete video generation process:
 * Template → HTML → Puppeteer Render → FFmpeg Encode → MP4
 */

import { v4 as uuidv4 } from 'uuid';
import { mkdirSync, existsSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import templateLoader from './templateLoader.js';
import { generateSequenceHTML } from './htmlGenerator.js';
import MotionEngine from './motionEngine.js';
import { renderToFrames } from './render.js';
import { encodeVideo, encodeVideoWithAudio, cleanupFrames } from './encode.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Job storage
const jobs = new Map();

export const JobStatus = {
    PENDING: 'pending',
    GENERATING_HTML: 'generating_html',
    RENDERING: 'rendering',
    ENCODING: 'encoding',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

function ensureDirectories() {
    const dirs = [
        join(__dirname, '../../output'),
        join(__dirname, '../../output/temp'),
        join(__dirname, '../../output/videos'),
    ];

    for (const dir of dirs) {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }

    return {
        temp: join(__dirname, '../../output/temp'),
        videos: join(__dirname, '../../output/videos'),
    };
}

function updateJobStatus(jobId, status, data = {}) {
    const job = jobs.get(jobId);
    if (job) {
        job.status = status;
        job.updatedAt = new Date().toISOString();
        Object.assign(job, data);
        jobs.set(jobId, job);
        console.log(`📋 Job ${jobId}: ${status}`);
    }
}

/**
 * Create a new job entry
 */
export function createJob(config) {
    const jobId = uuidv4();
    const job = {
        id: jobId,
        status: JobStatus.PENDING,
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        outputPath: null,
        error: null,
    };
    jobs.set(jobId, job);
    return jobId;
}

/**
 * Process an existing job
 */
export async function processJob(jobId) {
    const job = jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    const config = job.config;
    const dirs = ensureDirectories();
    const frameDir = join(dirs.temp, jobId);

    try {
        // Quality Presets
        const QUALITY_SETTINGS = {
            low: { fps: 24, crf: 28 },
            medium: { fps: 30, crf: 23 },
            high: { fps: 60, crf: 18 }
        };
        const quality = config.quality || 'medium';
        const { fps, crf } = QUALITY_SETTINGS[quality] || QUALITY_SETTINGS.medium;

        // Aspect Ratio
        const aspectRatio = config.aspectRatio || '16:9';
        const dimensions = templateLoader.getAspectRatio(aspectRatio);

        if (!dimensions) {
            throw new Error(`Invalid aspect ratio: ${aspectRatio}`);
        }

        // ===== PHASE 1: Generate HTML =====
        updateJobStatus(jobId, JobStatus.GENERATING_HTML, { progress: 10 });

        if (!config.scenes || config.scenes.length === 0) {
            throw new Error('BrandMotion sequences require "scenes" to be defined.');
        }

        console.log(`🎬 Processing sequence with ${config.scenes.length} scenes`);

        const timeline = MotionEngine.calculateMasterTimeline(config.scenes);

        // LIMIT CHECK
        if (timeline.totalDuration > 60000) {
            throw new Error("Video exceeds 60 seconds limit (v1 limit). Please shorten scenes.");
        }

        const html = generateSequenceHTML(config, timeline);

        // Add buffer
        const totalDuration = (timeline.totalDuration / 1000) + 1;

        updateJobStatus(jobId, JobStatus.GENERATING_HTML, { progress: 20 });

        // ===== PHASE 2: Render Frames =====
        updateJobStatus(jobId, JobStatus.RENDERING, { progress: 25 });

        mkdirSync(frameDir, { recursive: true });

        const renderResult = await renderToFrames(html, {
            outputDir: frameDir,
            width: dimensions.width,
            height: dimensions.height,
            duration: totalDuration,
            fps: fps,
            onProgress: (percent) => {
                // Map render progress (0-100) to global progress (25-60)
                const globalProgress = 25 + Math.round((percent / 100) * 35);
                updateJobStatus(jobId, JobStatus.RENDERING, { progress: globalProgress });
            }
        });

        updateJobStatus(jobId, JobStatus.RENDERING, {
            progress: 60,
            frameCount: renderResult.frameCount,
        });

        // ===== PHASE 3: Encode Video =====
        updateJobStatus(jobId, JobStatus.ENCODING, { progress: 65 });

        const outputFilename = `${jobId}.mp4`;
        const outputPath = join(dirs.videos, outputFilename);

        // Handle Audio
        let audioPath = config.audioPath;
        let audioVolume = config.audioVolume || 0.5;

        if (config.audio && config.audio.dataUrl) {
            try {
                const matches = config.audio.dataUrl.match(/^data:(.+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const buffer = Buffer.from(matches[2], 'base64');
                    const tempAudioPath = join(frameDir, 'audio_track.mp3');
                    writeFileSync(tempAudioPath, buffer);
                    audioPath = tempAudioPath;
                    audioVolume = config.audio.volume || 0.5;
                }
            } catch (e) {
                console.warn("Failed to process audio data:", e);
            }
        }

        if (audioPath && existsSync(audioPath)) {
            await encodeVideoWithAudio({
                framePattern: renderResult.framePattern,
                audioPath: audioPath,
                outputPath,
                fps: renderResult.fps,
                width: dimensions.width,
                height: dimensions.height,
                duration: totalDuration,
                audioVolume: audioVolume,
                crf: crf,
            });
        } else {
            await encodeVideo({
                framePattern: renderResult.framePattern,
                outputPath,
                fps: renderResult.fps,
                width: dimensions.width,
                height: dimensions.height,
                crf: crf,
            });
        }

        updateJobStatus(jobId, JobStatus.ENCODING, { progress: 90 });

        // ===== PHASE 4: Cleanup =====
        cleanupFrames(frameDir);

        try {
            rmSync(frameDir, { recursive: true });
        } catch (err) { }

        // ===== COMPLETE =====
        updateJobStatus(jobId, JobStatus.COMPLETED, {
            progress: 100,
            outputPath,
            outputFilename,
            duration: totalDuration,
            dimensions,
        });

        // Auto-Cleanup (15 minutes)
        setTimeout(() => {
            try {
                if (existsSync(outputPath)) {
                    rmSync(outputPath);
                    console.log(`🧹 Auto-deleted ${outputFilename}`);
                }
            } catch (e) { console.error('Cleanup error', e); }
        }, 15 * 60 * 1000);

        return {
            success: true,
            jobId,
            outputPath,
            outputFilename,
            duration: totalDuration,
            dimensions,
        };

    } catch (error) {
        console.error(`❌ Job ${jobId} failed:`, error.message);
        updateJobStatus(jobId, JobStatus.FAILED, {
            error: error.message,
        });

        try {
            if (existsSync(frameDir)) {
                rmSync(frameDir, { recursive: true });
            }
        } catch (err) { }

        throw error;
    }
}

/**
 * Generate video (Legacy Sync Wrapper)
 */
export async function generateVideo(config) {
    const jobId = createJob(config);
    return processJob(jobId);
}

export function getJob(jobId) {
    return jobs.get(jobId) || null;
}

export function getAllJobs() {
    return Array.from(jobs.values());
}

export function deleteJob(jobId) {
    return jobs.delete(jobId);
}

export function getTemplateData() {
    return {
        animations: templateLoader.getAnimations(),
        backgrounds: templateLoader.getBackgrounds(),
        aspectRatios: templateLoader.getAspectRatios(),
        fonts: templateLoader.getFonts(),
    };
}

export default {
    generateVideo,
    createJob,
    processJob,
    getJob,
    getAllJobs,
    deleteJob,
    getTemplateData,
    JobStatus,
};
