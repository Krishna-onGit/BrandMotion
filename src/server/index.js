import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
    generateVideo,
    createJob,
    processJob,
    getJob,
    getAllJobs,
    getTemplateData,
    JobStatus,
} from '../engine/pipeline.js';
import { checkFFmpeg } from '../engine/encode.js';
import { renderPreview } from '../engine/render.js';
// import { generateAnimationHTML } from '../engine/htmlGenerator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve generated videos
// Serve generated videos with forced download
app.use('/output', express.static(join(__dirname, '../../output/videos'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Disposition', 'attachment');
    }
}));

// =====================
// Health & Status
// =====================

app.get('/api/health', async (req, res) => {
    const ffmpegAvailable = await checkFFmpeg();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        dependencies: {
            ffmpeg: ffmpegAvailable,
        },
    });
});

// =====================
// Templates
// =====================

/**
 * GET /api/templates
 * Returns all available templates (animations, backgrounds, fonts, etc.)
 */
app.get('/api/templates', (req, res) => {
    try {
        const templates = getTemplateData();
        res.json({
            success: true,
            data: templates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// =====================
// Video Generation
// =====================

/**
 * POST /api/generate
 * Start video generation job
 */
app.post('/api/generate', async (req, res) => {
    try {
        const config = req.body;

        if (!config.text && !config.textBlocks) {
            return res.status(400).json({
                success: false,
                error: 'Either "text" or "textBlocks" is required',
            });
        }

        console.log('📥 Received generation request:', {
            text: config.text?.substring(0, 50) + '...',
            animation: config.animationId,
            aspect: config.aspectRatio,
        });

        const result = await generateVideo(config);

        res.json({
            success: true,
            data: {
                jobId: result.jobId,
                outputUrl: `/output/${result.outputFilename}`,
                duration: result.duration,
                dimensions: result.dimensions,
            },
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/generate/async
 */
// Standard Export Endpoint (v1)
app.post('/api/export', (req, res) => {
    try {
        const config = req.body;

        // v1 Limits
        if (config.scenes && config.scenes.length > 10) {
            return res.status(400).json({ success: false, error: 'Max 10 scenes allowed in v1.' });
        }

        const jobId = createJob(config);
        processJob(jobId).catch(err => console.error(`Job ${jobId} failed:`, err.message));

        res.json({
            success: true,
            jobId,
            status: 'processing',
            checkStatusAt: `/api/jobs/${jobId}`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/generate/async (Legacy alias)
 */
app.post('/api/generate/async', (req, res) => {
    try {
        const config = req.body;

        // Start Async Job
        const jobId = createJob(config);

        // Process in background
        processJob(jobId).catch(err => {
            console.error(`Background job ${jobId} failed:`, err.message);
        });

        res.json({
            success: true,
            jobId: jobId,
            message: 'Generation started',
            checkStatusAt: `/api/jobs/${jobId}`,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// =====================
// Preview
// =====================

app.post('/api/preview', async (req, res) => {
    res.status(410).json({ error: 'Endpoint deprecated. Use client-side preview.' });
});

// =====================
// Jobs
// =====================

app.get('/api/jobs', (req, res) => {
    const jobs = getAllJobs();
    res.json({
        success: true,
        count: jobs.length,
        data: jobs.map(job => ({
            id: job.id,
            status: job.status,
            progress: job.progress,
            createdAt: job.createdAt,
            outputUrl: job.outputFilename ? `/output/${job.outputFilename}` : null,
            error: job.error,
        })),
    });
});

app.get('/api/jobs/:id', (req, res) => {
    const job = getJob(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            error: 'Job not found',
        });
    }

    res.json({
        success: true,
        data: {
            id: job.id,
            status: job.status,
            progress: job.progress,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            outputUrl: job.outputFilename ? `/output/${job.outputFilename}` : null,
            error: job.error,
        },
    });
});

// =====================
// Error Handler
// =====================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// =====================
// Start Server
// =====================

async function start() {
    console.log('\n🎬 MotionText Studio - Video Generator\n');

    const ffmpegOk = await checkFFmpeg();
    if (!ffmpegOk) {
        console.warn('⚠️  FFmpeg not found. Video encoding will not work.');
    }

    app.listen(PORT, () => {
        console.log(`🚀 API Server running on http://localhost:${PORT}`);
        console.log(`📁 Videos served from http://localhost:${PORT}/output/\n`);
    });
}

// Only start server if run directly (CLI/Local)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    start();
}

export default app;
