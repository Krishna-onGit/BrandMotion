/**
 * FFmpeg Video Encoder
 * Converts rendered frames to MP4 video
 * Supports audio mixing and various encoding options
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { existsSync, unlinkSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Set FFmpeg path from static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Default encoding configuration
 */
const DEFAULT_ENCODING = {
    codec: 'libx264',
    preset: 'medium',
    crf: 23,
    pixelFormat: 'yuv420p',
    audioCodec: 'aac',
    audioBitrate: '192k',
};

/**
 * Encode frames to MP4 video
 * @param {Object} options Encoding options
 * @returns {Promise<Object>} Encoding result
 */
export async function encodeVideo(options) {
    const {
        framePattern,
        outputPath,
        fps = 30,
        width,
        height,
        codec = DEFAULT_ENCODING.codec,
        preset = DEFAULT_ENCODING.preset,
        crf = DEFAULT_ENCODING.crf,
    } = options;

    console.log(`🎥 Encoding video: ${outputPath}`);
    console.log(`   Input: ${framePattern}`);
    console.log(`   Settings: ${codec}, ${preset}, CRF ${crf}, ${fps}fps`);

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(framePattern)
            .inputFPS(fps)
            .videoCodec(codec)
            .outputOptions([
                `-preset ${preset}`,
                `-crf ${crf}`,
                `-pix_fmt ${DEFAULT_ENCODING.pixelFormat}`,
                '-movflags +faststart', // Enable streaming
            ])
            .size(`${width}x${height}`)
            .fps(fps)
            .output(outputPath)
            .on('start', (cmd) => {
                console.log(`   FFmpeg command: ${cmd}`);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    process.stdout.write(`\r   Encoding: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log('\n✅ Video encoded successfully');
                resolve({
                    success: true,
                    outputPath,
                    codec,
                    preset,
                    crf,
                    fps,
                });
            })
            .on('error', (err) => {
                console.error('\n❌ Encoding failed:', err.message);
                reject(err);
            })
            .run();
    });
}

/**
 * Encode video with background audio
 * @param {Object} options Encoding options with audio
 * @returns {Promise<Object>} Encoding result
 */
export async function encodeVideoWithAudio(options) {
    const {
        framePattern,
        audioPath,
        outputPath,
        fps = 30,
        width,
        height,
        duration,
        audioVolume = 0.5,
        fadeAudio = true,
        loop = true,
    } = options;

    if (!existsSync(audioPath)) {
        throw new Error(`Audio file not found: ${audioPath}`);
    }

    console.log(`🎥 Encoding video with audio: ${outputPath}`);
    console.log(`   Video: ${framePattern}`);
    console.log(`   Audio: ${audioPath} (volume: ${audioVolume})`);

    return new Promise((resolve, reject) => {
        let command = ffmpeg()
            .input(framePattern)
            .inputFPS(fps)
            .input(audioPath);

        // Audio options
        const audioFilters = [`volume=${audioVolume}`];

        if (fadeAudio && duration) {
            // Fade in first 0.5s, fade out last 1s
            const fadeOutStart = Math.max(0, duration - 1);
            audioFilters.push(`afade=t=in:st=0:d=0.5`);
            audioFilters.push(`afade=t=out:st=${fadeOutStart}:d=1`);
        }

        command
            .videoCodec(DEFAULT_ENCODING.codec)
            .audioCodec(DEFAULT_ENCODING.audioCodec)
            .audioBitrate(DEFAULT_ENCODING.audioBitrate)
            .outputOptions([
                `-preset ${DEFAULT_ENCODING.preset}`,
                `-crf ${DEFAULT_ENCODING.crf}`,
                `-pix_fmt ${DEFAULT_ENCODING.pixelFormat}`,
                '-movflags +faststart',
                '-shortest', // End when shortest stream ends
            ])
            .complexFilter([
                // Loop audio if needed
                loop ? `[1:a]aloop=loop=-1:size=2e+09[alooped]` : '[1:a]acopy[alooped]',
                `[alooped]${audioFilters.join(',')}[aout]`,
            ])
            .outputOption('-map 0:v')
            .outputOption('-map [aout]')
            .size(`${width}x${height}`)
            .fps(fps);

        if (duration) {
            command.duration(duration);
        }

        command
            .output(outputPath)
            .on('start', (cmd) => {
                console.log(`   FFmpeg command: ${cmd}`);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    process.stdout.write(`\r   Encoding: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log('\n✅ Video with audio encoded successfully');
                resolve({
                    success: true,
                    outputPath,
                    hasAudio: true,
                });
            })
            .on('error', (err) => {
                console.error('\n❌ Encoding with audio failed:', err.message);
                reject(err);
            })
            .run();
    });
}

/**
 * Clean up temporary frame files
 * @param {string} frameDir Directory containing frames
 * @returns {number} Number of files deleted
 */
export function cleanupFrames(frameDir) {
    if (!existsSync(frameDir)) return 0;

    const files = readdirSync(frameDir).filter(f => f.startsWith('frame_'));
    let deleted = 0;

    for (const file of files) {
        try {
            unlinkSync(join(frameDir, file));
            deleted++;
        } catch (err) {
            console.warn(`Failed to delete ${file}:`, err.message);
        }
    }

    console.log(`🧹 Cleaned up ${deleted} temporary frame files`);
    return deleted;
}

/**
 * Get video metadata
 * @param {string} videoPath Path to video file
 * @returns {Promise<Object>} Video metadata
 */
export async function getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

            resolve({
                duration: metadata.format.duration,
                size: metadata.format.size,
                bitrate: metadata.format.bit_rate,
                video: videoStream ? {
                    codec: videoStream.codec_name,
                    width: videoStream.width,
                    height: videoStream.height,
                    fps: eval(videoStream.r_frame_rate),
                } : null,
                audio: audioStream ? {
                    codec: audioStream.codec_name,
                    channels: audioStream.channels,
                    sampleRate: audioStream.sample_rate,
                } : null,
            });
        });
    });
}

/**
 * Check if FFmpeg is available
 * @returns {Promise<boolean>}
 */
export async function checkFFmpeg() {
    return new Promise((resolve) => {
        ffmpeg.getAvailableFormats((err, formats) => {
            if (err) {
                console.error('❌ FFmpeg not found or not working');
                resolve(false);
            } else {
                console.log('✅ FFmpeg is available');
                resolve(true);
            }
        });
    });
}

export default {
    encodeVideo,
    encodeVideoWithAudio,
    cleanupFrames,
    getVideoMetadata,
    checkFFmpeg,
};
