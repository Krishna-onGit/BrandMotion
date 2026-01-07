# BrandMotion

MotionText Studio - A free, open-source animated text-to-video generator.

## Features
- ✨ Single and Multi-scene text animations
- 🎨 Custom branding (fonts, colors, backgrounds)
- 📐 Aspect ratio support (16:9, 9:16, 1:1)
- 🎬 Automatic video encoding with FFmpeg
- 🎵 Background audio support
- 🚀 Deployable to Vercel

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Engine**: Puppeteer (frame capture), FFmpeg (encoding)

## Local Development

### Prerequisites
- Node.js (v18+)
- FFmpeg (automatically installed via `ffmpeg-static`)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Vercel Deployment

This project is optimized for Vercel using `puppeteer-core` and `@sparticuz/chromium`.

### Persistence Note
Vercel's serverless functions have a read-only filesystem except for `/tmp`.
- **Job Status**: Tracked via `jobs.json` in `/tmp`. This persists as long as the Lambda instance remains active.
- **Videos**: Generated videos are stored in `/tmp` and served via the `/output` route.
- **Limitations**: For production use with high volume, consider using an external database (Redis/Postgres) and cloud storage (AWS S3) for the exported videos.

## License
MIT
