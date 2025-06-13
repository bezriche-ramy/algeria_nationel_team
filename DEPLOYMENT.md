# 🚀 Vercel Deployment Guide

## Quick Deployment Steps

### Option 1: GitHub + Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy with Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project
   - Click "Deploy"

### Option 2: Direct Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy (Y)
   - Which scope? (Select your account)
   - Link to existing project? (N)
   - What's your project's name? (national-team)
   - In which directory is your code located? (./)

## Project Configuration

✅ **Already Configured:**
- `vercel.json` - Optimized for Vite deployment
- `vite.config.js` - Production-ready build settings
- `package.json` - All dependencies included
- Build optimization for Three.js assets
- Proper caching headers for 3D models

## Build Information

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- **Node Version:** 18.x or higher

## Important Notes

1. **3D Model:** Your `african_cup_of_nations.glb` file will be served from `/public/`
2. **Asset Optimization:** Large Three.js chunks are normal for 3D applications
3. **Performance:** First load might be slower due to 3D assets, but subsequent loads will be fast
4. **Browser Support:** Modern browsers required for WebGL support

## Troubleshooting

If you encounter issues:

1. **Build Errors:** Run `npm run build` locally first
2. **Missing Dependencies:** Check `package.json` includes all required packages
3. **3D Model Issues:** Ensure `.glb` file is in `public/` directory
4. **Performance:** Consider using `loading="lazy"` for better initial load times

## Post-Deployment

After deployment, your site will be available at:
- `https://your-project-name.vercel.app`
- Custom domain can be configured in Vercel dashboard

## Environment Variables (if needed)

If you need environment variables, create them in:
- Vercel Dashboard → Project → Settings → Environment Variables
- Or use `.env.local` for local development (already gitignored)
