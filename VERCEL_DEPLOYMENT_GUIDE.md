# Vercel Deployment Guide

This guide explains how to deploy both applications in your monorepo to Vercel with custom domains.

## Overview

- **Main App**: Deploy to `rhythmsync.app`
- **Organizers App**: Deploy to `organizers.rhythmsync.app`

## Prerequisites

1. Have both domains (`rhythmsync.app`) registered and DNS configured
2. Vercel CLI installed: `npm i -g vercel`
3. Vercel account connected to your GitHub repository

## Deployment Steps

### 1. Deploy Main App (rhythmsync.app)

1. **Create New Vercel Project for Main App:**
   ```bash
   cd apps/main-app
   vercel --prod
   ```

2. **Configure Project Settings:**
   - **Root Directory**: `apps/main-app`
   - **Build Command**: `cd ../.. && npm run build:main-app`
   - **Output Directory**: `dist`
   - **Install Command**: `cd ../.. && npm install`

3. **Add Custom Domain:**
   - Go to your Vercel dashboard
   - Select the main-app project
   - Go to Settings → Domains
   - Add `rhythmsync.app`
   - Add `www.rhythmsync.app` (optional)

### 2. Deploy Organizers App (organizers.rhythmsync.app)

1. **Create New Vercel Project for Organizers App:**
   ```bash
   cd apps/organizers-app
   vercel --prod
   ```

2. **Configure Project Settings:**
   - **Root Directory**: `apps/organizers-app`
   - **Build Command**: `cd ../.. && npm run build:organizers-app`
   - **Output Directory**: `dist`
   - **Install Command**: `cd ../.. && npm install`

3. **Add Custom Domain:**
   - Go to your Vercel dashboard
   - Select the organizers-app project
   - Go to Settings → Domains
   - Add `organizers.rhythmsync.app`

## Alternative: Deploy via Vercel Dashboard

If you prefer using the Vercel dashboard:

### For Main App:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Configure build settings:**
   - Framework Preset: `Other`
   - Root Directory: `apps/main-app`
   - Build Command: `cd ../.. && npm run build:main-app`
   - Output Directory: `dist`
   - Install Command: `cd ../.. && npm install`

### For Organizers App:
1. Create another project from the same repository
2. **Configure build settings:**
   - Framework Preset: `Other`
   - Root Directory: `apps/organizers-app`
   - Build Command: `cd ../.. && npm run build:organizers-app`
   - Output Directory: `dist`
   - Install Command: `cd ../.. && npm install`

## DNS Configuration

### For rhythmsync.app:
```
Type: A
Name: @
Value: 76.76.19.164

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For organizers.rhythmsync.app:
```
Type: CNAME
Name: organizers
Value: cname.vercel-dns.com
```

## Environment Variables

Make sure to add any required environment variables in each Vercel project's settings:
- Database URLs
- API keys
- Supabase configuration
- Any other secrets your applications need

## Important Notes

1. **Monorepo Structure**: Both projects build from the repository root to access shared packages
2. **Build Dependencies**: The build commands ensure all packages are built in the correct order
3. **Static Routing**: The `vercel.json` files handle SPA routing for React Router
4. **Caching**: Static assets are cached for optimal performance

## Troubleshooting

### Build Failures:
- Ensure all dependencies are properly installed
- Check that shared packages build correctly
- Verify environment variables are set

### Domain Issues:
- Allow 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check SSL certificate status in Vercel dashboard

### Performance:
- Both apps use optimized Vite builds
- Static assets are cached with long-term headers
- Consider adding edge functions for dynamic content if needed

## Testing

After deployment, test both applications:
- Main app: https://rhythmsync.app
- Organizers app: https://organizers.rhythmsync.app

Verify all functionality works correctly in the production environment. 