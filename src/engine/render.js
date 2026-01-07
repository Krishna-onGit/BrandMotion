/**
 * Puppeteer Renderer
 * Captures animated HTML as video frames using headless Chrome
 * Supports frame-by-frame capture and screencast recording
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Default rendering configuration
 */
const DEFAULT_CONFIG = {
    fps: 30,
    quality: 90,
    timeout: 30000,
};

/**
 * Render HTML animation to frames
 * @param {string} html HTML content to render
 * @param {Object} options Rendering options
 * @returns {Promise<Object>} Render result with frame paths
 */
export async function renderToFrames(html, options = {}) {
    const {
        outputDir,
        width = 1920,
        height = 1080,
        duration = 3,
        fps = DEFAULT_CONFIG.fps,
        quality = DEFAULT_CONFIG.quality,
        onProgress, // NEW
    } = options;

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🎬 Starting render: ${width}x${height} @ ${fps}fps for ${duration}s`);

    let browser;
    try {
        if (process.env.VERCEL) {
            // Vercel Serverless Environment
            const chromium = await import('@sparticuz/chromium').then(m => m.default);
            const puppeteerCore = await import('puppeteer-core').then(m => m.default);

            // Required for Vercel
            chromium.setGraphicsMode = false;

            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        } else {
            // Local / Standard Node
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    `--window-size=${width},${height}`,
                ],
            });
        }

        const page = await browser.newPage();

        // Set viewport to exact dimensions
        await page.setViewport({
            width,
            height,
            deviceScaleFactor: 1,
        });

        // Load HTML content
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: DEFAULT_CONFIG.timeout,
        });

        // Wait for fonts to load
        await page.evaluate(() => document.fonts.ready);

        // Calculate frame count
        const totalFrames = Math.ceil(duration * fps);

        console.log(`📸 Capturing ${totalFrames} frames...`);

        // Force pause all animations initially to take control
        await page.evaluate(() => {
            document.getAnimations({ subtree: true }).forEach(anim => {
                anim.pause();
                anim.currentTime = 0;
            });
        });

        const framePaths = [];

        // Capture frames deterministically
        for (let i = 0; i < totalFrames; i++) {
            const frameNumber = String(i).padStart(5, '0');
            const framePath = join(outputDir, `frame_${frameNumber}.png`);

            // Calculate exact time for this frame
            const currentTime = i / fps;

            // Seek all animations to this time
            await page.evaluate((timeSeconds) => {
                document.getAnimations({ subtree: true }).forEach(anim => {
                    anim.currentTime = timeSeconds * 1000;
                });
            }, currentTime);

            await page.screenshot({
                path: framePath,
                type: 'png',
                clip: { x: 0, y: 0, width, height },
            });

            framePaths.push(framePath);

            // Report Progress
            if (onProgress) {
                const percent = Math.round(((i + 1) / totalFrames) * 100);
                onProgress(percent);
            }

            // Console Log
            if (i % Math.ceil(totalFrames / 10) === 0) {
                const p = Math.round((i / totalFrames) * 100);
                console.log(`   ${p}% complete... (Frame ${i}/${totalFrames})`);
            }
        }

        console.log(`✅ Captured ${framePaths.length} frames`);

        return {
            success: true,
            frameCount: framePaths.length,
            framePaths,
            framePattern: join(outputDir, 'frame_%05d.png'),
            fps,
            width,
            height,
            duration,
        };

    } catch (error) {
        console.error('❌ Render failed:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Render HTML animation using Chrome DevTools Protocol screencast
 * More efficient for longer animations
 * @param {string} html HTML content
 * @param {Object} options Rendering options
 * @returns {Promise<Object>} Render result
 */
export async function renderWithScreencast(html, options = {}) {
    const {
        outputDir,
        width = 1920,
        height = 1080,
        duration = 3,
        quality = 80,
    } = options;

    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🎬 Starting screencast render: ${width}x${height} for ${duration}s`);

    let browser;
    try {
        if (process.env.VERCEL) {
            const chromium = await import('@sparticuz/chromium').then(m => m.default);
            const puppeteerCore = await import('puppeteer-core').then(m => m.default);
            chromium.setGraphicsMode = false;
            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        } else {
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                ],
            });
        }

        const page = await browser.newPage();
        await page.setViewport({ width, height, deviceScaleFactor: 1 });

        // Get CDP session for screencast
        const client = await page.target().createCDPSession();

        const frames = [];
        let frameIndex = 0;

        // Listen for screencast frames
        client.on('Page.screencastFrame', async (event) => {
            const { data, sessionId } = event;

            // Save frame
            const frameNumber = String(frameIndex++).padStart(5, '0');
            const framePath = join(outputDir, `frame_${frameNumber}.png`);

            const buffer = Buffer.from(data, 'base64');
            writeFileSync(framePath, buffer);
            frames.push(framePath);

            // Acknowledge frame receipt
            await client.send('Page.screencastFrameAck', { sessionId });
        });

        // Load content
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);

        // Start screencast
        await client.send('Page.startScreencast', {
            format: 'png',
            quality,
            maxWidth: width,
            maxHeight: height,
            everyNthFrame: 1,
        });

        // Wait for animation duration
        await delay(duration * 1000);

        // Stop screencast
        await client.send('Page.stopScreencast');

        console.log(`✅ Captured ${frames.length} screencast frames`);

        return {
            success: true,
            frameCount: frames.length,
            framePaths: frames,
            framePattern: join(outputDir, 'frame_%05d.png'),
            width,
            height,
            duration,
        };

    } catch (error) {
        console.error('❌ Screencast render failed:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Quick preview render - lower quality, faster
 * @param {string} html HTML content
 * @param {Object} options Options
 * @returns {Promise<Buffer>} Single frame image buffer
 */
export async function renderPreview(html, options = {}) {
    const { width = 640, height = 360 } = options;

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setViewport({ width, height, deviceScaleFactor: 1 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);

        // Wait a bit for animation to start
        await delay(500);

        const screenshot = await page.screenshot({
            type: 'png',
            encoding: 'binary',
        });

        return screenshot;

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Utility delay function
 * @param {number} ms Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    renderToFrames,
    renderWithScreencast,
    renderPreview,
};
